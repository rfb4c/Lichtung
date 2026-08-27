/**
 * 99 · 复现校验 —— 用同一份判据重跑一遍，与已提交的结果逐条 diff。
 *
 * 为什么需要这个脚本：这一代模型已经移除了 temperature，也没有 seed，所以
 * **同一输入重跑不保证同一输出**。可复现性只能声称
 *
 *   固定模型 ID + 判据/schema 随代码入库 + 结果落盘 + 重跑差异已记录
 *
 * 而不能声称 deterministic。这个脚本产出的就是「重跑差异已记录」那一项的证据。
 *
 * **比对单位是问题组，不是民调 id。** 同一道题的不同年份版本被裁决层视为同一个
 * 答案（见 03-merge 的说明），judge 在两次运行里挑了同题的不同年份，产出完全相同，
 * 记成「不稳定」会虚报波动。组外变化才是真波动；组内换年份单独计数报告。
 *
 * **量的是精确层，不是最终挂载。** 兜底层是查表，同一份数据重跑必然同一结果，
 * 把它并进来只会把这个数字往 100% 稀释。论文报这个数时要说明它衡量的是模型
 * 判断的稳定性，覆盖的是精确层。
 *
 * 用法
 *   npm run match:verify                    mock 基线，免费
 *   npm run match:verify -- --confirm-spend 实跑基线，会再花一轮钱
 */

import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import type { PollingData } from '../../src/types';
import { runMatching } from './01-match-polling';
import {
  PATHS,
  candidatesFor,
  pollGroupKey,
  readAppData,
  readMatches,
  readPrompt,
  readSchema,
  sha256,
} from './lib/io';
import type { JudgeSlot, MatchFile } from './lib/types';

interface Divergence {
  reportId: string;
  slot: JudgeSlot;
  before: string;
  after: string;
  /** 组外变化才是真波动；组内换年份产出不变 */
  sameGroup: boolean;
}

export function diffRuns(
  baseline: MatchFile,
  rerun: MatchFile,
  groupOf: (id: string | null) => string,
  /**
   * 这篇报道有没有候选可选。候选为空的报道两边只能判 null，重跑必然一致——
   * 那是构造使然，不是模型稳定。计进复现率会把数字抬向 100%，且样本越缺民调、
   * 数字越好看。单独计数，不进分母。
   */
  hasCandidates: (reportId: string) => boolean,
): { compared: number; forced: number; divergences: Divergence[] } {
  const divergences: Divergence[] = [];
  let compared = 0;
  let forced = 0;

  for (const [reportId, before] of Object.entries(baseline.verdicts)) {
    const after = rerun.verdicts[reportId];
    if (!after) continue;

    for (const slot of ['A', 'B'] as JudgeSlot[]) {
      const b = before[slot];
      const a = after[slot];
      if (!b || !a) continue;

      if (!hasCandidates(reportId)) {
        forced += 1;
        continue;
      }

      compared += 1;
      const bid = b.alignedPollId ?? '不挂';
      const aid = a.alignedPollId ?? '不挂';
      if (bid === aid) continue;

      divergences.push({
        reportId,
        slot,
        before: bid,
        after: aid,
        sameGroup: groupOf(b.alignedPollId) === groupOf(a.alignedPollId),
      });
    }
  }

  return { compared, forced, divergences };
}

async function main(): Promise<void> {
  if (!existsSync(PATHS.matches)) {
    console.error('还没有 poll-matches.json，先跑 npm run match:mock 或 npm run match。');
    process.exit(1);
  }

  const baseline = readMatches();
  const providers = new Set(baseline.meta.runs.map((r) => r.provider));
  const isMock = providers.size === 1 && providers.has('mock');

  // 判据变了还去做「复现校验」，量到的是配置差异不是采样波动，
  // 而报出来的数字长得一模一样。在花钱之前先拦住。
  const drifted = [
    baseline.meta.promptSha256 !== sha256(readPrompt()) ? '判据 prompts/path-b-match.md' : null,
    baseline.meta.schemaSha256 !== sha256(JSON.stringify(readSchema()))
      ? 'schemas/poll-match.json'
      : null,
  ].filter(Boolean);

  if (drifted.length > 0) {
    console.error(
      `${drifted.join(' 与 ')} 已改动，但 poll-matches.json 是改动前跑出来的。\n` +
        '此时重跑量到的是「换了判据」，不是采样波动——报出来的却是同一个「一致率」数字。\n' +
        '要么恢复判据，要么先整体重跑 npm run match 再来校验。',
    );
    process.exit(1);
  }

  if (!isMock && !process.argv.includes('--confirm-spend')) {
    console.error(
      '基线是实跑结果，重跑会再花一轮 API 费用。\n' +
        '确认要花这笔钱，就加 --confirm-spend 重来一次。',
    );
    process.exit(1);
  }

  const outPath = join(tmpdir(), `lichtung-poll-matches-rerun-${Date.now()}.json`);
  console.log(`重跑一遍（${isMock ? 'mock' : '实跑'}），结果写到临时文件：\n  ${outPath}\n`);

  const { file: rerun, failures } = await runMatching({
    judges: isMock ? 'mock' : 'real',
    outPath,
    resume: false,
    quiet: true,
  });

  if (failures > 0) {
    console.error(
      `\n重跑有 ${failures} 次调用失败，比对的样本会少掉这些条目，` +
        '算出来的一致率不能代表整批。先修好再来。',
    );
    process.exit(1);
  }

  // 同理：换了 judge 型号再来「复现校验」，量到的是两个模型的分歧
  const modelDrift = baseline.meta.runs.flatMap((before) => {
    const after = rerun.meta.runs.find((r) => r.slot === before.slot);
    if (!after || (after.provider === before.provider && after.model === before.model)) {
      return [];
    }
    return [
      `Judge ${before.slot}：${before.provider}/${before.model} → ${after.provider}/${after.model}`,
    ];
  });

  if (modelDrift.length > 0) {
    console.error(
      '重跑用的模型与基线不同，这个 diff 量的是模型差异不是采样波动：\n' +
        modelDrift.map((d) => `  ・${d}`).join('\n') +
        '\n把 .env 的 OPENAI_JUDGE_MODEL 恢复成基线用的型号再来。',
    );
    process.exit(1);
  }

  const appData = readAppData();
  const polls = new Map(
    (appData.pollingData as PollingData[]).map((p) => [p.id, pollGroupKey(p)]),
  );
  const groupOf = (id: string | null): string => (id === null ? '·null·' : polls.get(id) ?? '·未知·');

  const candidateCount = new Map(
    appData.reports.map((r) => [r.id, candidatesFor(appData, r).length]),
  );

  const { compared, forced, divergences } = diffRuns(baseline, rerun, groupOf, (id) =>
    (candidateCount.get(id) ?? 0) > 0,
  );
  const crossGroup = divergences.filter((d) => !d.sameGroup);
  const withinGroup = divergences.filter((d) => d.sameGroup);
  const stable = compared - crossGroup.length;
  const rate = compared === 0 ? 0 : (stable / compared) * 100;

  console.log(`重跑一致率：${stable}/${compared} 条判定（${rate.toFixed(1)}%）`);
  console.log(`  组外变化（产出会变）: ${crossGroup.length}`);
  console.log(`  组内换年份（产出不变，不计入不稳定）: ${withinGroup.length}`);
  console.log(`  另有 ${forced} 条判定的候选为空，两次都只能判 null——构造使然，未计入分母`);

  if (divergences.length === 0) {
    console.log('两次运行逐条完全一致。');
    return;
  }

  const show = (label: string, rows: Divergence[]): void => {
    if (rows.length === 0) return;
    console.log(`\n${label}`);
    for (const d of rows) {
      console.log(`  ${d.reportId.padEnd(18)} Judge ${d.slot}  ${d.before} → ${d.after}`);
    }
  };
  show('组外变化：', crossGroup);
  show('组内换年份：', withinGroup);

  console.log(
    '\n这些差异是模型采样的固有波动，不是 bug。论文里应如实报重跑一致率，\n' +
      '不要声称管线是确定性的。',
  );
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
