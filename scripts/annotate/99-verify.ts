/**
 * 99 · 复现校验 —— 用同一份 rubric 重跑一遍，与已提交的结果逐属性 diff。
 *
 * 为什么需要这个脚本：Sonnet 5 / Opus 5 这一代已经移除了 temperature，
 * 也没有 seed，所以**同一输入重跑不保证同一输出**。可复现性只能声称
 *
 *   固定模型 ID + prompt/schema 随代码入库 + 结果落盘 + 重跑差异已记录
 *
 * 而不能声称 deterministic。这个脚本产出的就是「重跑差异已记录」那一项的
 * 证据；论文里报重跑一致率，比含糊地说"可复现"诚实。
 *
 * 用法
 *   npm run annotate:verify                    mock 基线，免费
 *   npm run annotate:verify -- --confirm-spend 实跑基线，会再花一轮钱
 */

import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { runAnnotation } from './01-annotate-path-a';
import { PATHS, readAnnotations, readPrompt, readSchema, sha256 } from './lib/io';
import type { AnnotationFile, JudgeSlot, JudgeVerdict } from './lib/types';

/** 参与比对的三个属性，取的是进入公式的那个二值量。 */
const FACETS = {
  typicality: (v: JudgeVerdict) => v.typicality.present,
  heterogeneity: (v: JudgeVerdict) => v.heterogeneity.present,
  violation: (v: JudgeVerdict) => v.violation.level === 'moderate',
} as const;

type Facet = keyof typeof FACETS;

interface Divergence {
  reportId: string;
  slot: JudgeSlot;
  facet: Facet;
  before: boolean;
  after: boolean;
}

export function diffRuns(
  baseline: AnnotationFile,
  rerun: AnnotationFile,
): { compared: number; divergences: Divergence[] } {
  const divergences: Divergence[] = [];
  let compared = 0;

  for (const [reportId, before] of Object.entries(baseline.verdicts)) {
    const after = rerun.verdicts[reportId];
    if (!after) continue;

    for (const slot of ['A', 'B'] as JudgeSlot[]) {
      const b = before[slot];
      const a = after[slot];
      if (!b || !a) continue;

      for (const facet of Object.keys(FACETS) as Facet[]) {
        compared += 1;
        const bv = FACETS[facet](b);
        const av = FACETS[facet](a);
        if (bv !== av) divergences.push({ reportId, slot, facet, before: bv, after: av });
      }
    }
  }

  return { compared, divergences };
}

async function main(): Promise<void> {
  if (!existsSync(PATHS.annotations)) {
    console.error('还没有 annotations.json，先跑 npm run annotate:mock 或 npm run annotate。');
    process.exit(1);
  }

  const baseline = readAnnotations();
  const providers = new Set(baseline.meta.runs.map((r) => r.provider));
  const isMock = providers.size === 1 && providers.has('mock');

  // rubric 变了而结果没重跑，是最容易在论文里说错话的情形——先拦下来
  if (baseline.meta.promptSha256 !== sha256(readPrompt())) {
    console.warn('⚠ rubric 已修改，但 annotations.json 是旧 rubric 跑出来的。');
  }
  if (baseline.meta.schemaSha256 !== sha256(JSON.stringify(readSchema()))) {
    console.warn('⚠ schema 已修改，但 annotations.json 是旧 schema 跑出来的。');
  }

  if (!isMock && !process.argv.includes('--confirm-spend')) {
    console.error(
      '基线是实跑结果，重跑会再花一轮 API 费用。\n' +
        '确认要花这笔钱，就加 --confirm-spend 重来一次。',
    );
    process.exit(1);
  }

  const outPath = join(tmpdir(), `lichtung-annotations-rerun-${Date.now()}.json`);
  console.log(`重跑一遍（${isMock ? 'mock' : '实跑'}），结果写到临时文件：\n  ${outPath}\n`);

  const rerun = await runAnnotation({
    judges: isMock ? 'mock' : 'real',
    outPath,
    resume: false,
    quiet: true,
  });

  const { compared, divergences } = diffRuns(baseline, rerun);
  const stable = compared - divergences.length;
  const rate = compared === 0 ? 0 : (stable / compared) * 100;

  console.log(`重跑一致率：${stable}/${compared} 个属性判定（${rate.toFixed(1)}%）`);

  if (divergences.length === 0) {
    console.log('两次运行逐属性完全一致。');
    return;
  }

  console.log('\n不一致的条目：');
  for (const d of divergences) {
    console.log(
      `  ${d.reportId}  Judge ${d.slot}  ${d.facet.padEnd(14)} ${d.before} → ${d.after}`,
    );
  }
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
