/**
 * 匹配管线的读写层。所有落盘都从这里走，脚本不直接碰文件系统。
 *
 * 三条硬规矩：
 *   一、app-data.json 是人工事实源，本管线只允许改 report.pollingDataId 这一个
 *       字段，逐字段赋值而非整体替换。
 *   二、密钥只从 process.env 读，绝不写进任何产物。
 *   三、`.env` 解析与内容哈希直接复用标注管线的实现——同一套语义只该有一份代码。
 *       其余部分不共用：Path A 的判定路径已实跑并被论文引用，保持不动。
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import type { AppData, PollingData, Report } from '../../../src/types';
import { loadEnv, sha256 } from '../../annotate/lib/io';
import type { MatchFile, MatchInput, PollCandidate } from './types';

export { loadEnv, sha256 };

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '../../..');

export const PATHS = {
  appData: resolve(REPO_ROOT, 'src/data/app-data.json'),
  matches: resolve(REPO_ROOT, 'src/data/poll-matches.json'),
  prompt: resolve(HERE, '../prompts/path-b-match.md'),
  schema: resolve(HERE, '../schemas/poll-match.json'),
} as const;

/** 取密钥；缺失时给出可执行的提示而不是抛一个裸 undefined。 */
export function requireKey(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `缺少环境变量 ${name}。请在仓库根目录的 .env 里补一行 ${name}=...\n` +
        `（配置步骤见 scripts/match-polling/README.md）`,
    );
  }
  return value;
}

// ── 候选民调 ─────────────────────────────────────────────────────────────

/**
 * 同一道题的不同年份版本，在命题上无法区分——两个 judge 在年份上达不成一致
 * 也不必达成。归组键把它们收成一个，年份留给裁决层按确定性规则挑。
 *
 * 键由「命题所在层级 + 逐字题干」构成：题干是命题的载体，层级把恰好同题
 * 但归属不同子议题的条目分开。题干做空白归一化，避免录入时的换行差异分组。
 */
export function pollGroupKey(poll: PollingData): string {
  const scope = poll.subtopicId ?? poll.topicId;
  const wording = (poll.questionWording ?? '').replace(/\s+/g, ' ').trim().toLowerCase();
  return `${scope}::${wording}`;
}

/** 调查执行期的起始日；缺 fieldDates 时退回年中，保证永远可比较。 */
function fieldStart(poll: PollingData): string {
  const start = poll.fieldDates?.slice(0, 10);
  return start && /^\d{4}-\d{2}-\d{2}$/.test(start) ? start : `${poll.surveyYear}-07-01`;
}

/**
 * 在同一问题组里挑一条。判据完全确定性，不经过模型：**取调查执行期最新的那条**。
 *
 * 为什么不按「距报道发表日最近」——那才是直觉上更对的规则：
 * `report.publishedAt` 不是时间戳，是 Feed 上的相对展示标签（"2h"、"1d"），
 * 28 篇全部如此，`Date.parse` 一条都解析不了。demo 把整个 Feed 呈现为「此刻」，
 * 报道之间根本没有可比的绝对日期，所以「就近」在这份数据上没有定义。
 * 读者在此刻看到的应当是最新一次调查——这是这份数据支持得起的规则。
 *
 * ⚠️ 若将来 publishedAt 改成真实日期，这条规则值得重新考虑；在那之前不要
 * 把它「修」回按发表日就近，那会静默回落成取数组第一条。
 *
 * 并列时依次比 surveyYear、id 字典序，保证同一输入永远同一输出。
 */
export function pickPollInGroup(group: PollingData[]): PollingData {
  return [...group].sort((a, b) => {
    const cmp = fieldStart(b).localeCompare(fieldStart(a));
    if (cmp !== 0) return cmp;
    if (a.surveyYear !== b.surveyYear) return b.surveyYear - a.surveyYear;
    return a.id.localeCompare(b.id);
  })[0];
}

export function readAppData(): AppData {
  return JSON.parse(readFileSync(PATHS.appData, 'utf8')) as AppData;
}

/** 按议题取候选。顺序固定：subtopic 在前，同级按 id——两个 judge 必须看到同一份。 */
export function candidatesFor(appData: AppData, report: Report): PollCandidate[] {
  return (appData.pollingData as PollingData[])
    .filter((p) => p.topicId === report.topicId)
    .sort((a, b) => {
      const rank = (p: PollingData): number => (p.level === 'subtopic' ? 0 : 1);
      return rank(a) - rank(b) || a.id.localeCompare(b.id);
    })
    .map((p) => ({
      id: p.id,
      level: p.level ?? 'subtopic',
      questionWording: p.questionWording ?? '',
      scaleLabels: p.scaleLabels,
      source: p.source,
      surveyYear: p.surveyYear,
    }));
}

/**
 * 喂给 judge 的输入。
 * 刻意不传 pollingDataId ——既有的人工挂载会让重评退化成复读人工结论。
 */
export function toMatchInputs(appData: AppData): MatchInput[] {
  return appData.reports.map((r: Report) => ({
    id: r.id,
    title: r.title,
    summary: r.summary,
    source: r.source,
    candidates: candidatesFor(appData, r),
  }));
}

// ── 写回 ─────────────────────────────────────────────────────────────────

/**
 * 把裁决出的挂载写回 app-data.json。
 * 逐条按 id 匹配、只赋 pollingDataId 这一个字段；其余内容原样保留。
 */
export function writePollingIds(ids: Record<string, string | null>): {
  changed: number;
  missing: string[];
} {
  const data = JSON.parse(readFileSync(PATHS.appData, 'utf8')) as AppData;
  const missing: string[] = [];
  let changed = 0;

  for (const report of data.reports) {
    if (!(report.id in ids)) {
      missing.push(report.id);
      continue;
    }
    const next = ids[report.id];
    if ((report.pollingDataId ?? null) !== next) changed += 1;
    report.pollingDataId = next;
  }

  writeFileSync(PATHS.appData, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  return { changed, missing };
}

// ── 匹配文件 ─────────────────────────────────────────────────────────────

/** path 可指向临时文件——复现校验会把重跑结果写到别处再做 diff。 */
export function readMatches(path: string = PATHS.matches): MatchFile {
  if (!existsSync(path)) {
    throw new Error(`找不到 ${path}。先跑 npm run match 生成两个 judge 的判定。`);
  }
  return JSON.parse(readFileSync(path, 'utf8')) as MatchFile;
}

export function writeMatches(file: MatchFile, path: string = PATHS.matches): void {
  writeFileSync(path, `${JSON.stringify(file, null, 2)}\n`, 'utf8');
}

export function readPrompt(): string {
  return readFileSync(PATHS.prompt, 'utf8');
}

export function readSchema(): Record<string, unknown> {
  return JSON.parse(readFileSync(PATHS.schema, 'utf8')) as Record<string, unknown>;
}
