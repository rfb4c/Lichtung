/**
 * 03 · 裁决 → 写回。
 *
 * 裁决规则（事前写定，不做人工干预）。两层，精确优先：
 *
 *   精确层  两个 judge 落在同一个**问题组**       → 挂该组里按日期选出的那条
 *   ↓ 其余一切情况（都判 null、一方 null、分属不同组）
 *   兜底层  报道所属议题有 topic 级民调           → 挂它（查表，不经模型）
 *   ↓ 该议题没有 topic 级民调
 *           不挂
 *
 * 「精确的能中就用精确的，中不了就用广义的兜底」——两层各自的判据是不同的东西：
 * 精确层问「报道的核心命题是不是这条民调问的那件事」，要模型判、要证据；
 * 兜底层问「报道属不属于这个议题」，这个答案已经写在 report.topicId 里，
 * 查表即可，不需要也不应该再过一遍模型。
 *
 * **「分歧即不挂」已不再是本管线的规则。** 精确层谈不拢仍然拒绝挂上那条精确
 * 民调——两个独立 judge 对命题是否对齐都谈不拢，本身就说明对齐关系不清晰，
 * 把一份回答别的问题的分布摆在读者面前，与 Path B 想做的事正好相反。但拒绝的
 * 结果是掉到兜底层，而不是什么都不显示。这一层的克制仍在，只是不再一路到底。
 *
 * 年份不参与一致性判定。同一道题的不同年份版本在命题上无法区分，让两个 judge
 * 在年份上达成一致既不可能也不必要——归组见 pollGroupKey()，组内选条见
 * pickPollInGroup()，两者都是确定性的，不经过模型。
 *
 * ── 弃权怎么进这套规则（与 Path A 同一套，见 annotate/03-merge.ts）────────
 *
 * 「证据不足」是与「没有可挂的候选」并列的第三种结果。行为上两者相同——都掉到
 * 兜底层——但在记录与统计上分开：
 *
 *   两个 judge 都弃权 → 'both_abstained'，剔除出 κ 的分母，单独报弃权率
 *   一方弃权一方判定 → 'disagree'，进 κ 的分母
 *
 * 一方弃权算不一致，是因为「证据够不够」本身就是两个模型可以真实分歧的事情；
 * 两个都弃权则没有「判定是否一致」可谈，算成一致会让缺文本冒充共识。
 *
 * 用法
 *   npm run match:merge            只裁决并打印 diff，不写任何文件
 *   npm run match:merge -- --apply 确认无误后写回 app-data.json
 */

import { pathToFileURL } from 'node:url';

import type { AppData, PollingData, Report } from '../../src/types';
import {
  PATHS,
  candidatesFor,
  pickPollInGroup,
  pollGroupKey,
  readAppData,
  readMatches,
  readPrompt,
  readSchema,
  readSourceTextsRaw,
  sha256,
  topicFallbackFor,
  writeMatches,
  writePollingIds,
} from './lib/io';
import type { MatchAgreement, MatchFile, MatchVerdict, MergedMatch } from './lib/types';

/** 判定引用了民调库里查不到的 id。见 groupOf 的说明。 */
interface UnresolvedRef {
  reportId: string;
  slot: 'A' | 'B';
  id: string;
}

/** 裁决单篇：先走精确层，不成立再走兜底层。两份 verdict 必须都在——半份判定不许进裁决。 */
function mergeOne(
  report: Report,
  a: MatchVerdict,
  b: MatchVerdict,
  pollsById: Map<string, PollingData>,
  fallback: PollingData | null,
  unresolved: UnresolvedRef[],
): MergedMatch {
  const previous = report.pollingDataId ?? null;

  const groupOf = (id: string | null, slot: 'A' | 'B'): string | null => {
    if (id === null) return null;
    const poll = pollsById.get(id);
    if (poll) return pollGroupKey(poll);

    // 走到这里只有一种可能：跑判定与跑裁决之间民调库变了。01 的闸已经挡过
    // 「id 不在候选里」，而候选正是从民调库生成的——但 01 与 03 是刻意解耦的
    // （判据改了不必重新花钱跑模型），中间隔着任意长的时间。
    //
    // 不能静默当作「不挂」：那会把「两个 judge 都指向同一条已消失的民调」
    // 记成「两个 judge 都认为无可挂」，agreement 就此错标，而这个字段会汇总成
    // 论文里的一致率。宁可让 mergeAll 报错停下。
    unresolved.push({ reportId: report.id, slot, id });
    return null;
  };

  // 弃权的一侧不带 group：它没有说「没有可挂的」，它说的是「读不到足以判断的」。
  // 两者若都折成 null，一方弃权、一方判 no_alignment 就会被记成 agree_null。
  const abstainedA = a.outcome === 'insufficient_evidence';
  const abstainedB = b.outcome === 'insufficient_evidence';
  const ga = abstainedA ? null : groupOf(a.alignedPollId, 'A');
  const gb = abstainedB ? null : groupOf(b.alignedPollId, 'B');

  // agreement 只描述精确层上两个 judge 谈没谈拢，与最终挂到哪一层无关。
  // 两者分开记，是为了让论文的一致率只在模型真正做过判断的那一层上算。
  const agreement: MatchAgreement =
    abstainedA && abstainedB
      ? 'both_abstained'
      : abstainedA || abstainedB
        ? 'disagree'
        : ga !== null && ga === gb
          ? 'agree_mount'
          : ga === null && gb === null
            ? 'agree_null'
            : 'disagree';

  // ① 精确层：两个 judge 落在同一个问题组
  if (agreement === 'agree_mount') {
    const group = [...pollsById.values()].filter((p) => pollGroupKey(p) === ga);
    const chosen = pickPollInGroup(group);

    // resolution 会汇总进论文的分层计数，所以不能靠「模型只看得到 subtopic 级」
    // 这个上游约定来推断。那个约定由 01 的候选组装与候选外 id 闸保证，而 01 与
    // 03 是刻意解耦的，中间隔着任意长的时间。这里实测一次，对不上就停下——
    // 记一个说不通的 'subtopic' 比报错更难查。
    if ((chosen.level ?? 'subtopic') !== 'subtopic') {
      throw new Error(
        `${report.id}：两个 judge 一致挂到 ${chosen.id}，但它是 ${chosen.level} 级民调。\n` +
          '精确层只应看到 subtopic 级候选——议题级由兜底层查表挂载，不经过模型。\n' +
          '这份判定多半是用旧版候选组装跑出来的，重跑 npm run match 再裁决。',
      );
    }

    return {
      reportId: report.id,
      agreement,
      resolution: 'subtopic',
      pollingDataId: chosen.id,
      groupKey: ga,
      previous,
    };
  }

  // ② 兜底层：精确层没结论，但报道属于一个有议题级民调的议题
  if (fallback) {
    return {
      reportId: report.id,
      agreement,
      resolution: 'topic_fallback',
      pollingDataId: fallback.id,
      groupKey: pollGroupKey(fallback),
      previous,
    };
  }

  // ③ 两层都不成立
  return { reportId: report.id, agreement, resolution: 'none', pollingDataId: null, groupKey: null, previous };
}

export interface MergeSummary {
  merged: Record<string, MergedMatch>;
  /**
   * 精确层上两个 judge 的一致性，**只统计候选非空的报道**。
   *
   * 候选为空的报道两边必然都判 null——那不是两个 judge 想到一处去了，是没有
   * 东西可想。把它算进一致率会让数字凭空变好看，且样本越是缺民调、数字越高。
   * 论文的一致率与 κ 取这一组，分母是 judged。
   */
  counts: Record<'agree_mount' | 'agree_null' | 'disagree' | 'both_abstained', number>;
  /** 候选非空、模型真正做过选择的报道数。κ 的分母还要再减去 both_abstained */
  judged: number;
  /** 候选为空、模型无从可判的报道数。不进 counts，但要如实报出来 */
  forcedNull: number;
  /** 挂载分别由哪一层定下来的，分母是全部报道。与 counts 是两件事，不可互相换算 */
  resolutions: Record<'subtopic' | 'topic_fallback' | 'none', number>;
  /** 裁决结果与 app-data.json 现状不同的条目 */
  changes: MergedMatch[];
}

export function mergeAll(file: MatchFile, appData: AppData): MergeSummary {
  const pollsById = new Map(
    (appData.pollingData as PollingData[]).map((p) => [p.id, p]),
  );

  // 兜底查表按议题缓存：同议题的报道答案必然相同，而 topicFallbackFor 在
  // 议题有多条 topic 级民调时会抛错，缓存让这个错只报一次而不是每篇一次。
  const fallbackCache = new Map<string, PollingData | null>();
  const fallbackFor = (report: Report): PollingData | null => {
    const key = report.topicId ?? '';
    if (!fallbackCache.has(key)) fallbackCache.set(key, topicFallbackFor(appData, report));
    return fallbackCache.get(key) ?? null;
  };

  const missing: string[] = [];
  const unresolved: UnresolvedRef[] = [];
  const merged: Record<string, MergedMatch> = {};
  const counts = { agree_mount: 0, agree_null: 0, disagree: 0, both_abstained: 0 };
  const resolutions = { subtopic: 0, topic_fallback: 0, none: 0 };
  let judged = 0;
  let forcedNull = 0;

  for (const report of appData.reports) {
    const pair = file.verdicts[report.id];
    if (!pair?.A || !pair?.B) {
      missing.push(report.id);
      continue;
    }
    const result = mergeOne(report, pair.A, pair.B, pollsById, fallbackFor(report), unresolved);
    merged[report.id] = result;
    resolutions[result.resolution] += 1;

    // 候选为空时模型无从可判，它的 agreement 不承载信息，不进一致率的分母。
    // 判定照样跑、照样落盘——「问了，两边都说没有可挂的」本身是要留痕的证据。
    if (candidatesFor(appData, report).length === 0) forcedNull += 1;
    else {
      judged += 1;
      counts[result.agreement] += 1;
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `${missing.length} 篇报道缺少完整的两份判定，不能裁决：\n` +
        missing.map((id) => `  ・${id}`).join('\n') +
        '\n先跑 npm run match -- --resume 把缺的补上。',
    );
  }

  if (unresolved.length > 0) {
    throw new Error(
      `${unresolved.length} 条判定引用了民调库里查不到的 id，不能裁决：\n` +
        unresolved
          .map((u) => `  ・${u.reportId} / Judge ${u.slot} → ${u.id}`)
          .join('\n') +
        '\n跑判定与跑裁决之间民调库变了。静默当作「不挂」会把一致率记错，所以这里停下。\n' +
        '要么把这些民调恢复回 app-data.json，要么删掉 poll-matches.json 用当前的库重跑判定。',
    );
  }

  const changes = Object.values(merged).filter((m) => m.pollingDataId !== m.previous);
  return { merged, counts, judged, forcedNull, resolutions, changes };
}

/**
 * 判据漂移闸。
 *
 * 01 与 03 是刻意解耦的——改裁决规则不必重新花钱跑模型。但那说的是**裁决规则**，
 * 也就是这个文件；判据文件改了是另一回事：此时 poll-matches.json 里的判定来自
 * 一份已经不存在的判据，而 merge 会照常算出一组数、照常写回，产出上完全看不出
 * 它对应的是哪一版判据。论文引用的一致率就此挂到错误的判据上。
 *
 * 只比判据与 schema 的哈希，不比模型 ID——换模型的判断留给 --resume 那道闸。
 */
function assertRubricCurrent(file: MatchFile): void {
  const drifted = [
    file.meta.promptSha256 !== sha256(readPrompt()) ? 'prompts/path-b-match.md' : null,
    file.meta.schemaSha256 !== sha256(JSON.stringify(readSchema()))
      ? 'schemas/poll-match.json'
      : null,
    file.meta.sourceTextsSha256 !== sha256(readSourceTextsRaw())
      ? 'src/data/source-texts.json'
      : null,
  ].filter(Boolean);

  if (drifted.length === 0) return;

  throw new Error(
    `${drifted.join(' 与 ')} 已改动，但 ${PATHS.matches} 里的判定是改动前跑出来的。\n` +
      '裁决规则改了不必重跑模型，判据改了必须重跑——现在这份判定对应的是一份\n' +
      '已经不存在的判据，算出来的一致率会被挂到新判据名下。\n' +
      '要么恢复判据文件，要么跑 npm run match 用当前判据重出一份判定。',
  );
}

// ── 呈现 ─────────────────────────────────────────────────────────────────

function reportSummary(summary: MergeSummary, appData: AppData): void {
  const { counts, judged, forcedNull, resolutions, changes, merged } = summary;
  const total = judged + forcedNull;
  const pct = (n: number, d: number): string => `${d === 0 ? 0 : ((n / d) * 100).toFixed(1)}%`;

  // 两组数分开报，因为它们回答的是两个不同问题：模型在精确层上谈拢了吗、
  // 最终这条挂载是从哪一层来的。合成一张表会让人把兜底当成模型的判断。
  // κ 的分母不是 judged，是 judged 再减去双方都弃权的那些。分母印在每一行里，
  // 否则读者会默认它就是 judged，而「把两边都读不动的条目划掉」正是最看不出来的
  // 那一类操作。
  const kappaN = judged - counts.both_abstained;
  console.log('\n精确层 · 两个 judge 的一致性（论文的一致率与 κ 取这一组）');
  console.log(`  候选非空、模型真正做过选择的报道  ${judged}/${total}`);
  console.log(`  其中双方都弃权，剔除出分母        ${counts.both_abstained}`);
  console.log(`  κ 的分母                          ${kappaN}`);
  console.log(`  一致·同一命题   ${counts.agree_mount}/${kappaN}  ${pct(counts.agree_mount, kappaN)}`);
  console.log(`  一致·都无对齐   ${counts.agree_null}/${kappaN}  ${pct(counts.agree_null, kappaN)}`);
  console.log(`  分歧            ${counts.disagree}/${kappaN}  ${pct(counts.disagree, kappaN)}`);
  console.log('  ↑ 分歧含「一方弃权一方判定」——那是真实分歧，不剔除');
  console.log(`  一致率 ${pct(counts.agree_mount + counts.agree_null, kappaN)}`);
  console.log(`\n  另有 ${forcedNull}/${total} 篇候选为空，两个 judge 只能都判 null——`);
  console.log('  那不是一致，是没有东西可判，已排除在上面的分母之外。');

  console.log('\n挂载来源 · 每条挂载由哪一层定下（兜底层不经过模型）');
  console.log(`  精确层 subtopic  ${resolutions.subtopic}/${total}  ${pct(resolutions.subtopic, total)}`);
  console.log(`  兜底层 topic     ${resolutions.topic_fallback}/${total}  ${pct(resolutions.topic_fallback, total)}`);
  console.log(`  不挂             ${resolutions.none}/${total}  ${pct(resolutions.none, total)}`);
  console.log('  ↑「不挂」全部是所属议题没有 topic 级民调可兜底，不是模型判定不挂');

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
      console.log(
        `    ${r.reportId.padEnd(18)} ${r.previous ?? '不挂'} → ${r.pollingDataId ?? '不挂'}` +
          `  [${r.agreement} · ${r.resolution}]`,
      );
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
  assertRubricCurrent(file);
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
