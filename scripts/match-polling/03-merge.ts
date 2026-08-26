/**
 * 03 · 裁决 → 写回。
 *
 * 裁决规则（事前写定，不做人工干预）：
 *
 *   两个 judge 都判 null                    → 不挂
 *   两个 judge 落在同一个**问题组**          → 挂该组里按日期选出的那条
 *   其余一切情况（含一方 null、分属不同组）   → 不挂
 *
 * 「分歧即不挂」是这条管线唯一的裁决规则，跟 Path A「分歧取 0.5」是同一种克制：
 * 两个独立 judge 对命题是否对齐都谈不拢，本身就说明对齐关系不清晰，此时挂上去
 * 的风险高于不挂的代价。不挂只是不显示图表；挂错会把一份回答别的问题的分布
 * 摆在读者面前，那与 Path B 想做的事正好相反。
 *
 * 年份不参与一致性判定。同一道题的不同年份版本在命题上无法区分，让两个 judge
 * 在年份上达成一致既不可能也不必要——归组见 pollGroupKey()，组内选条见
 * pickPollInGroup()，两者都是确定性的，不经过模型。
 *
 * 用法
 *   npm run match:merge            只裁决并打印 diff，不写任何文件
 *   npm run match:merge -- --apply 确认无误后写回 app-data.json
 */

import { pathToFileURL } from 'node:url';

import type { AppData, PollingData, Report } from '../../src/types';
import {
  PATHS,
  pickPollInGroup,
  pollGroupKey,
  readAppData,
  readMatches,
  writeMatches,
  writePollingIds,
} from './lib/io';
import type { MatchFile, MatchVerdict, MergedMatch } from './lib/types';

/** 裁决单篇。两份 verdict 必须都在——半份判定不许进裁决。 */
function mergeOne(
  report: Report,
  a: MatchVerdict,
  b: MatchVerdict,
  pollsById: Map<string, PollingData>,
): MergedMatch {
  const previous = report.pollingDataId ?? null;

  const groupOf = (id: string | null): string | null => {
    if (id === null) return null;
    const poll = pollsById.get(id);
    // 01 的闸已经挡过「不在候选里」，这里再兜一次：判定引用了库里没有的 id
    // 时当作不成立，绝不写一个查不到的引用进渲染层。
    return poll ? pollGroupKey(poll) : null;
  };

  const ga = groupOf(a.alignedPollId);
  const gb = groupOf(b.alignedPollId);

  if (ga === null && gb === null) {
    return { reportId: report.id, agreement: 'agree_null', pollingDataId: null, groupKey: null, previous };
  }

  if (ga !== null && ga === gb) {
    const group = [...pollsById.values()].filter((p) => pollGroupKey(p) === ga);
    const chosen = pickPollInGroup(group);
    return {
      reportId: report.id,
      agreement: 'agree_mount',
      pollingDataId: chosen.id,
      groupKey: ga,
      previous,
    };
  }

  return { reportId: report.id, agreement: 'disagree', pollingDataId: null, groupKey: null, previous };
}

export interface MergeSummary {
  merged: Record<string, MergedMatch>;
  counts: Record<'agree_mount' | 'agree_null' | 'disagree', number>;
  /** 裁决结果与 app-data.json 现状不同的条目 */
  changes: MergedMatch[];
}

export function mergeAll(file: MatchFile, appData: AppData): MergeSummary {
  const pollsById = new Map(
    (appData.pollingData as PollingData[]).map((p) => [p.id, p]),
  );

  const missing: string[] = [];
  const merged: Record<string, MergedMatch> = {};
  const counts = { agree_mount: 0, agree_null: 0, disagree: 0 };

  for (const report of appData.reports) {
    const pair = file.verdicts[report.id];
    if (!pair?.A || !pair?.B) {
      missing.push(report.id);
      continue;
    }
    const result = mergeOne(report, pair.A, pair.B, pollsById);
    merged[report.id] = result;
    counts[result.agreement] += 1;
  }

  if (missing.length > 0) {
    throw new Error(
      `${missing.length} 篇报道缺少完整的两份判定，不能裁决：\n` +
        missing.map((id) => `  ・${id}`).join('\n') +
        '\n先跑 npm run match -- --resume 把缺的补上。',
    );
  }

  const changes = Object.values(merged).filter((m) => m.pollingDataId !== m.previous);
  return { merged, counts, changes };
}

// ── 呈现 ─────────────────────────────────────────────────────────────────

function reportSummary(summary: MergeSummary, appData: AppData): void {
  const { counts, changes, merged } = summary;
  const total = counts.agree_mount + counts.agree_null + counts.disagree;
  const pct = (n: number): string => `${((n / total) * 100).toFixed(1)}%`;

  console.log('\n裁决结果');
  console.log(`  一致·挂载   ${counts.agree_mount}/${total}  ${pct(counts.agree_mount)}`);
  console.log(`  一致·不挂   ${counts.agree_null}/${total}  ${pct(counts.agree_null)}`);
  console.log(`  分歧·不挂   ${counts.disagree}/${total}  ${pct(counts.disagree)}`);
  console.log(`  两个 judge 一致率 ${pct(counts.agree_mount + counts.agree_null)}`);

  console.log('\n按议题的挂载覆盖（覆盖率是结果，不是指标）');
  const byTopic = new Map<string, { n: number; mounted: number }>();
  for (const report of appData.reports) {
    const key = report.topicId ?? '(无议题)';
    const row = byTopic.get(key) ?? { n: 0, mounted: 0 };
    row.n += 1;
    if (merged[report.id]?.pollingDataId) row.mounted += 1;
    byTopic.set(key, row);
  }
  for (const [topic, row] of [...byTopic].sort()) {
    console.log(`  ${topic.padEnd(18)} ${row.mounted}/${row.n}`);
  }

  if (changes.length === 0) {
    console.log('\n与 app-data.json 现状无差异，无需写回。');
    return;
  }

  const added = changes.filter((c) => c.previous === null);
  const removed = changes.filter((c) => c.pollingDataId === null);
  const moved = changes.filter((c) => c.previous !== null && c.pollingDataId !== null);

  console.log(`\n与现状的差异 ${changes.length} 条`);
  const show = (label: string, rows: MergedMatch[]): void => {
    if (rows.length === 0) return;
    console.log(`\n  ${label}（${rows.length}）`);
    for (const r of rows) {
      console.log(`    ${r.reportId.padEnd(18)} ${r.previous ?? '不挂'} → ${r.pollingDataId ?? '不挂'}  [${r.agreement}]`);
    }
  };
  show('新增挂载', added);
  show('改挂他条', moved);
  show('摘除挂载', removed);

  if (removed.length > 0) {
    console.log(
      '\n⚠️ 摘除是风险最高的一类改动：这些报道现在有图表，写回后就没有了。\n' +
        '   逐条核对 poll-matches.json 里两个 judge 的 rejection 字段，确认理由站得住，再 --apply。',
    );
  }
}

// ── CLI ──────────────────────────────────────────────────────────────────

export function runMerge(apply: boolean): MergeSummary {
  const file = readMatches();
  const appData = readAppData();
  const summary = mergeAll(file, appData);

  console.log(`判据哈希 ${file.meta.promptSha256.slice(0, 12)}  schema ${file.meta.schemaSha256.slice(0, 12)}`);
  for (const run of file.meta.runs) {
    console.log(`  Judge ${run.slot}: ${run.provider} / ${run.model}  ${run.ranAt}`);
  }

  reportSummary(summary, appData);

  // merged 无论是否写回 app-data 都要落盘：它是「这次裁决得出了什么」的凭据，
  // 与「是否采纳」是两件事。
  writeMatches({ ...file, merged: summary.merged });
  console.log(`\n裁决已写入 ${PATHS.matches}`);

  if (!apply) {
    console.log('未加 --apply，app-data.json 未改动。核对上面的差异后再决定。');
    return summary;
  }

  const ids = Object.fromEntries(
    Object.values(summary.merged).map((m) => [m.reportId, m.pollingDataId]),
  );
  const { changed, missing } = writePollingIds(ids);
  console.log(`已写回 app-data.json：${changed} 条 pollingDataId 变更`);
  if (missing.length > 0) {
    console.error(`⚠️ ${missing.length} 篇报道不在裁决结果里，其挂载保持原样：${missing.join(', ')}`);
  }
  return summary;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  try {
    runMerge(process.argv.includes('--apply'));
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
