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
 * ── 弃权怎么进这套规则 ────────────────────────────────────────────────
 *
 * 「证据不足」是与「判定为不成立」并列的第三种结果（见 lib/types.ts）。
 * 它在**打分**与**统计**上被分开处理，这是两件事：
 *
 *   打分：弃权与「判不成立」完全同权，都记作不支持。
 *         弃权的报道因此留在基线位置，不被前移——没有证据就不干预，
 *         这条在行为上不该有第二种解释。
 *
 *   统计：两个 judge 都弃权   → 该属性不进 κ 的分母，单独报弃权率
 *         一方弃权一方判定   → 算作**不一致**，进 κ 的分母
 *
 * 「一方弃权一方判定」为什么算不一致：一个模型认为证据足够、另一个认为不够，
 * 这本身就是真实分歧，正是信度该捕捉的东西。把它剔除等于把最难的条目从考卷
 * 上划掉，剩下的一致率只是在描述容易的那一半。
 *
 * 两个都弃权则相反：那时根本没有「判定是否一致」这件事可谈，把它算成「一致」
 * 会让缺数据冒充共识——语料越缺文本，一致率越好看。所以剔除出分母，但必须
 * 单独报出来，不能悄悄消失。
 *
 * 加权公式不在这里——它只在 src/lib/csScore.ts 有一份实现，管线与运行时
 * 共用，避免两处漂移。
 *
 * 用法：npm run annotate:merge
 */

import { pathToFileURL } from 'node:url';

import { CS_WEIGHTS, computeCsScore, type CsAttribute } from '../../src/lib/csScore';
import { BOOST_FACTOR } from '../../src/lib/feedSorter';
import { readAnnotations, writeAnnotations, writeCsScores } from './lib/io';
import type { InputTier } from './lib/source-texts';
import { INSUFFICIENT } from './lib/types';
import type {
  Agreement,
  AnnotationFile,
  AttributeJudgement,
  JudgeVerdict,
  MergedAnnotation,
  ViolationJudgement,
} from './lib/types';

/**
 * 一个 judge 对一个属性的结果，拆成裁决真正用得上的两个量。
 * 分开存是必要的：打分只看 supported，统计只看 abstained，合成一个三值枚举
 * 会让每个调用点都得再解一次「弃权算不算支持」。
 */
interface Outcome {
  abstained: boolean;
  /** 弃权按不支持计——没有证据就不干预 */
  supported: boolean;
}

function attributeOutcome(judgement: AttributeJudgement): Outcome {
  return {
    abstained: judgement.judgment === INSUFFICIENT,
    supported: judgement.judgment === 'yes',
  };
}

/**
 * 违背强度是四选一，但进入公式的是「是否为中等违背」这个二值量。
 * 倒 U 形：none 与 extreme 同样不得分——extreme 会触发子类型化而失效，
 * 不是「更强的 moderate」。弃权与 none 在打分上同权，在统计上分开。
 */
function violationOutcome(judgement: ViolationJudgement): Outcome {
  return {
    abstained: judgement.level === INSUFFICIENT,
    supported: judgement.level === 'moderate',
  };
}

/** 两个 judge 对同一个属性的结果 → 0 / 0.5 / 1 与一致性标记。 */
function mergeAttribute(a: Outcome, b: Outcome): { value: number; agreement: Agreement } {
  if (a.abstained && b.abstained) return { value: 0, agreement: 'both_abstained' };

  // 打分：弃权已在 Outcome 里折成 supported=false，所以这一行对「判不成立」
  // 与「弃权」一视同仁——这正是「行为上不干预」要的效果。
  const value = a.supported === b.supported ? (a.supported ? 1 : 0) : 0.5;

  // 统计：一方弃权即为分歧，哪怕折算后的 supported 恰好相同
  //（「判不成立」对「弃权」会折成 false 对 false，看起来一致，其实不是）。
  const agreement: Agreement =
    a.abstained || b.abstained || a.supported !== b.supported ? 'disagree' : 'agree';

  return { value, agreement };
}

export function mergeVerdicts(a: JudgeVerdict, b: JudgeVerdict): MergedAnnotation {
  const merged = {
    typicality: mergeAttribute(
      attributeOutcome(a.typicality),
      attributeOutcome(b.typicality),
    ),
    heterogeneity: mergeAttribute(
      attributeOutcome(a.heterogeneity),
      attributeOutcome(b.heterogeneity),
    ),
    violation: mergeAttribute(violationOutcome(a.violation), violationOutcome(b.violation)),
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

function summarize(
  merged: Record<string, MergedAnnotation>,
  tiers: Record<string, InputTier>,
): string {
  const rows = Object.values(merged);
  const total = rows.length;
  if (total === 0) return '没有可裁决的条目。';

  const lines: string[] = [];

  // 分母写在每一行里：两个都弃权的条目被剔除出去了，不把分母印出来，
  // 读者会默认它是 total，而那正是「把最难的条目划掉」看不出来的方式。
  lines.push('两个 judge 的逐属性一致情况（分母已剔除双方都弃权的条目）：');
  for (const attribute of Object.keys(CS_WEIGHTS) as CsAttribute[]) {
    const abstained = rows.filter((r) => r.agreement[attribute] === 'both_abstained').length;
    const denominator = total - abstained;
    const agree = rows.filter((r) => r.agreement[attribute] === 'agree').length;
    const both = rows.filter(
      (r) => r.agreement[attribute] === 'agree' && r.attributes[attribute] === 1,
    ).length;
    const neither = rows.filter(
      (r) => r.agreement[attribute] === 'agree' && r.attributes[attribute] === 0,
    ).length;
    lines.push(
      `  ${attribute.padEnd(14)} 一致 ${agree}/${denominator}` +
        `（都成立 ${both} / 都不成立 ${neither} / 分歧 ${denominator - agree}）` +
        `  双方弃权 ${abstained}`,
    );
  }

  const tierCounts = new Map<InputTier, number>();
  for (const row of rows) {
    const tier = tiers[row.reportId] ?? 'headline';
    tierCounts.set(tier, (tierCounts.get(tier) ?? 0) + 1);
  }
  const tierOrder: InputTier[] = ['body', 'lede', 'og', 'headline'];
  lines.push('');
  lines.push(
    '判定输入层级：' +
      tierOrder
        .filter((t) => tierCounts.has(t))
        .map((t) => `${t} ${tierCounts.get(t)}`)
        .join('  ') +
      '　← 事后记录的结果，不是事前设的门槛',
  );

  const scores = rows.map((r) => r.csScore).sort((x, y) => y - x);
  const nonZero = scores.filter((s) => s > 0).length;
  const mean = scores.reduce((sum, s) => sum + s, 0) / total;
  lines.push('');
  lines.push(
    `csScore：${total} 篇中 ${nonZero} 篇 > 0，` +
      `均值 ${mean.toFixed(3)}，最高 ${scores[0].toFixed(3)}，` +
      `中位 ${scores[Math.floor(total / 2)].toFixed(3)}`,
  );

  // 位移档位：新键 = 位置 − round(总数 × BOOST_FACTOR × csScore)。
  // 系数从 feedSorter 取，不在这里重写一个字面量。
  const buckets = new Map<number, number>();
  for (const score of scores) {
    const shift = Math.round(total * BOOST_FACTOR * score);
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

  console.log(summarize(file.merged, file.tiers ?? {}));
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
  // readAnnotations 在文件缺失时抛的是一句可读的提示，别让它变成堆栈转储
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
