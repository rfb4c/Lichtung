/**
 * 标注管线的读写层。所有落盘都从这里走，脚本不直接碰文件系统。
 *
 * 两条硬规矩：
 *   一、app-data.json 是人工事实源，管线只允许改 report.csScore 这一个字段。
 *       写回时逐字段赋值而非整体替换，任何其他字段的意外改动都不会发生。
 *   二、密钥只从 process.env 读，绝不写进任何产物。变量名不带 VITE_ 前缀，
 *       否则 Vite 会把它内联进 dist/。
 */

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import type { AppData, Report } from '../../../src/types';
import { SOURCE_TEXTS_PATH, readSourceTexts, slotsOf, tierOf } from './source-texts';
import type { AnnotationFile, JudgeInput } from './types';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '../../..');

export const PATHS = {
  appData: resolve(REPO_ROOT, 'src/data/app-data.json'),
  annotations: resolve(REPO_ROOT, 'src/data/annotations.json'),
  prompt: resolve(HERE, '../prompts/path-a-cs.md'),
  schema: resolve(HERE, '../schemas/cs-attributes.json'),
  sourceTexts: SOURCE_TEXTS_PATH,
  env: resolve(REPO_ROOT, '.env'),
} as const;

// ── 环境变量 ─────────────────────────────────────────────────────────────

/**
 * 极简 .env 读取，避免为一个脚本引入 dotenv。
 * 已存在的 process.env 优先——CI 或 shell 里导出的值不该被文件覆盖。
 */
export function loadEnv(): void {
  if (!existsSync(PATHS.env)) return;
  for (const line of readFileSync(PATHS.env, 'utf8').split(/\r?\n/)) {
    const m = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
    if (!m) continue;
    const [, key, rawValue] = m;
    if (process.env[key] !== undefined) continue;
    process.env[key] = rawValue.trim().replace(/^(['"])(.*)\1$/, '$2');
  }
}

/** 取密钥；缺失时给出可执行的提示而不是抛一个裸 undefined。 */
export function requireKey(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `缺少环境变量 ${name}。请在仓库根目录的 .env 里补一行 ${name}=...\n` +
        `（配置步骤见 scripts/annotate/README.md）`,
    );
  }
  return value;
}

// ── 报道 ─────────────────────────────────────────────────────────────────

export function readAppData(): AppData {
  return JSON.parse(readFileSync(PATHS.appData, 'utf8')) as AppData;
}

/**
 * 喂给 judge 的输入 = 标题 + 出版方原文的全部非空槽位。
 *
 * 刻意不传 counterStereotypical 与 engagementScore，避免既有人工标注污染判定。
 * 也**不再传 report.summary**：卡片上的摘要现在就是 og:description（见
 * scripts/backfill-source-summaries.ts），它已经在 slots 里，再传一遍等于把
 * 同一段文字喂两次。summary 仍是撰写文本的那 4 条走 slots 全空的路径，
 * judge 只看得到标题——这正是要如实报告的那一层，不该用撰写文本填平。
 *
 * app-data.json 里有、source-texts.json 里没有的报道会拿到全空槽位而不是报错：
 * 缺快照是这批数据的既有事实（存档上没有就是没有），弃权机制专为此存在。
 */
export function toJudgeInputs(appData: AppData): JudgeInput[] {
  const texts = readSourceTexts(PATHS.sourceTexts);
  return appData.reports.map((r: Report) => {
    const slots = slotsOf(texts[r.id]);
    return { id: r.id, title: r.title, source: r.source, slots, tier: tierOf(slots) };
  });
}

/**
 * 把裁决出的 csScore 写回 app-data.json。
 * 逐条按 id 匹配、只赋这一个字段；其余内容原样保留。
 */
export function writeCsScores(scores: Record<string, number>): {
  updated: number;
  missing: string[];
} {
  const raw = readFileSync(PATHS.appData, 'utf8');
  const data = JSON.parse(raw) as AppData;
  const missing: string[] = [];
  let updated = 0;

  for (const report of data.reports) {
    const score = scores[report.id];
    if (score === undefined) {
      missing.push(report.id);
      continue;
    }
    report.csScore = score;
    updated += 1;
  }

  writeFileSync(PATHS.appData, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  return { updated, missing };
}

// ── 标注文件 ─────────────────────────────────────────────────────────────

/** path 可指向临时文件——99-verify 会把重跑结果写到别处再做 diff。 */
export function readAnnotations(path: string = PATHS.annotations): AnnotationFile {
  if (!existsSync(path)) {
    throw new Error(`找不到 ${path}。先跑 npm run annotate 生成两个 judge 的判定。`);
  }
  return JSON.parse(readFileSync(path, 'utf8')) as AnnotationFile;
}

export function writeAnnotations(
  file: AnnotationFile,
  path: string = PATHS.annotations,
): void {
  writeFileSync(path, `${JSON.stringify(file, null, 2)}\n`, 'utf8');
}

// ── rubric 与 schema ─────────────────────────────────────────────────────

export function readPrompt(): string {
  return readFileSync(PATHS.prompt, 'utf8');
}

export function readSchema(): Record<string, unknown> {
  return JSON.parse(readFileSync(PATHS.schema, 'utf8')) as Record<string, unknown>;
}

/**
 * 出版方原文的内容哈希。与 rubric / schema 的哈希同样进 meta。
 *
 * 判定输入现在有三个来源（判据、schema、原文槽位），任何一个变了而结果没
 * 重跑，产物就对应着一份已经不存在的输入。原文那一份尤其容易被漏掉——
 * 重跑一次采集脚本、Wayback 换了个快照，文件就变了，而从判定结果上看不出来。
 */
export function readSourceTextsRaw(): string {
  return readFileSync(PATHS.sourceTexts, 'utf8');
}

/**
 * rubric 与 schema 的内容哈希，写进 annotations.json 的 meta。
 * 用途：判定结果与 prompt 版本对不上时能立刻发现，而不是等到论文写完才发现
 * 附录里的 prompt 和实际跑的不是同一份。
 */
export function sha256(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex');
}
