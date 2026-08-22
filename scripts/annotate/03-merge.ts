/**
 * 03 · 裁决 —— 把两个 judge 的原始判定合成 csScore，写回 app-data.json。
 *
 * 裁决规则是**事前写定的确定性规则**，不引入人工裁决：
 *
 *   都判成立   → 1.0
 *   判断不一致 → 0.5   ← 分歧本身说明该属性存疑，只给一半把握
 *   都判不成立 → 0
 *
 * 让人来裁会引入研究者自由度（「你按什么标准裁的？会不会偏向让 demo 好看的
 * 一边？」），而模型分歧恰恰是「这条报道在该属性上本来就模糊」的证据。
 *
 * 加权公式不在这里——它只在 src/lib/csScore.ts 有一份实现，管线与运行时
 * 共用，避免两处漂移。
 *
 * 用法：npm run annotate:merge
 */

import { pathToFileURL } from 'node:url';

import { CS_WEIGHTS, computeCsScore, type CsAttribute } from '../../src/lib/csScore';
import { readAnnotations, writeAnnotations, writeCsScores } from './lib/io';
import type {
  Agreement,
  AnnotationFile,
  JudgeVerdict,
  MergedAnnotation,
} from './lib/types';

/** 两个 judge 对同一个二值属性的判断 → 0 / 0.5 / 1 与一致性标记。 */
function mergeAttribute(a: boolean, b: boolean): { value: number; agreement: Agreement } {
  if (a === b) return { value: a ? 1 : 0, agreement: 'agree' };
  return { value: 0.5, agreement: 'disagree' };
}

/**
 * 违背强度是三分类，但进入公式的是「是否为中等违背」这个二值量。
 * 倒 U 形：none 与 extreme 同样不得分——extreme 会触发子类型化而失效，
 * 不是「更强的 moderate」。
 */
function isModerate(verdict: JudgeVerdict): boolean {
  return verdict.violation.level === 'moderate';
}

export function mergeVerdicts(a: JudgeVerdict, b: JudgeVerdict): MergedAnnotation {
  const merged = {
    typicality: mergeAttribute(a.typicality.present, b.typicality.present),
    heterogeneity: mergeAttribute(a.heterogeneity.present, b.heterogeneity.present),
    violation: mergeAttribute(isModerate(a), isModerate(b)),
  } satisfies Record<CsAttribute, { value: number; agreement: Agreement }>;

  const attributes = {
    typicality: merged.typicality.value,
    heterogeneity: merged.heterogeneity.value,
    violation: merged.violation.value,
  };

  return {
    reportId: a.reportId,
    attributes,
    agreement: {
      typicality: merged.typicality.agreement,
      heterogeneity: merged.heterogeneity.agreement,
      violation: merged.violation.agreement,
    },
    csScore: computeCsScore(attributes),
  };
}

export function merge(file: AnnotationFile): {
  file: AnnotationFile;
  incomplete: string[];
} {
  const incomplete: string[] = [];
  const merged: Record<string, MergedAnnotation> = {};

  for (const [reportId, pair] of Object.entries(file.verdicts)) {
    if (!pair.A || !pair.B) {
      incomplete.push(reportId);
      continue;
    }
    merged[reportId] = mergeVerdicts(pair.A, pair.B);
  }

  return { file: { ...file, merged }, incomplete };
}

// ── 汇总输出 ─────────────────────────────────────────────────────────────

function summarize(merged: Record<string, MergedAnnotation>): string {
  const rows = Object.values(merged);
  const total = rows.length;
  if (total === 0) return '没有可裁决的条目。';

  const lines: string[] = [];

  lines.push('两个 judge 的逐属性一致情况：');
  for (const attribute of Object.keys(CS_WEIGHTS) as CsAttribute[]) {
    const agree = rows.filter((r) => r.agreement[attribute] === 'agree').length;
    const both = rows.filter((r) => r.attributes[attribute] === 1).length;
    const neither = rows.filter((r) => r.attributes[attribute] === 0).length;
    lines.push(
      `  ${attribute.padEnd(14)} 一致 ${agree}/${total}` +
        `（都成立 ${both} / 都不成立 ${neither} / 分歧 ${total - agree}）`,
    );
  }

  const scores = rows.map((r) => r.csScore).sort((x, y) => y - x);
  const nonZero = scores.filter((s) => s > 0).length;
  const mean = scores.reduce((sum, s) => sum + s, 0) / total;
  lines.push('');
  lines.push(
    `csScore：${total} 篇中 ${nonZero} 篇 > 0，` +
      `均值 ${mean.toFixed(3)}，最高 ${scores[0].toFixed(3)}，` +
      `中位 ${scores[Math.floor(total / 2)].toFixed(3)}`,
  );

  // 位移档位：新键 = 位置 − round(总数 × 0.3 × csScore)，与 feedSorter 一致
  const buckets = new Map<number, number>();
  for (const score of scores) {
    const shift = Math.round(total * 0.3 * score);
    buckets.set(shift, (buckets.get(shift) ?? 0) + 1);
  }
  const spread = [...buckets.entries()].sort((x, y) => y[0] - x[0]);
  lines.push(`位移档位分布：${spread.map(([s, n]) => `${s}格×${n}`).join('  ')}`);

  return lines.join('\n');
}

function main(): void {
  const { file, incomplete } = merge(readAnnotations());
  writeAnnotations(file);

  const scores = Object.fromEntries(
    Object.values(file.merged).map((m) => [m.reportId, m.csScore]),
  );
  const { updated, missing } = writeCsScores(scores);

  console.log(summarize(file.merged));
  console.log(`\n已写回 app-data.json：${updated} 篇报道的 csScore`);

  if (incomplete.length > 0) {
    console.warn(`\n缺少某一侧判定，未裁决：${incomplete.join(', ')}`);
  }
  if (missing.length > 0) {
    console.warn(`\napp-data.json 里这些报道没有标注：${missing.join(', ')}`);
    process.exitCode = 1;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main();
}
