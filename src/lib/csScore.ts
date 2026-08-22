/**
 * Path A —— 反刻板范例（counter-stereotypical exemplar）评分。
 *
 * 三个属性各自独立判断，加权合成 csScore（0–1）。权重与判据见
 * docs/04-Path-A-反刻板印象/算法设计.md § 2.2；此处是它的唯一实现，
 * 打分管线与运行时排序都从这里取，避免公式在两处漂移。
 *
 * 每个属性的取值只有三档：
 *   1.0  两个 judge 都判定成立
 *   0.5  两个 judge 判断不一致 —— 分歧本身说明该属性存疑，因此只给一半把握
 *   0    都判定不成立
 *
 * 取半分是事前写定的确定性规则，不是事后裁决：让人来裁会引入研究者自由度，
 * 而分歧恰恰是"这条报道在该属性上本来就模糊"的证据。
 */

/** 三属性权重。排序逻辑：门槛变量 > 直接机制 > 定义变量。 */
export const CS_WEIGHTS = {
  /** 典型性——主角是否被呈现为群体的普通成员。不典型则认知更新不会泛化，故为门槛 */
  typicality: 0.40,
  /** 异质性线索——报道是否显式提供"这不是一个人"的信号。直接对应中介变量 */
  heterogeneity: 0.35,
  /** 中等强度违背——倒 U：仅 moderate 得分，extreme 会触发子类型化而失效 */
  violation: 0.25,
} as const;

export type CsAttribute = keyof typeof CS_WEIGHTS;

/** 单条报道的三属性得分，每项取 0 / 0.5 / 1 */
export type CsAttributes = Record<CsAttribute, number>;

export function computeCsScore(attrs: CsAttributes): number {
  const raw = (Object.keys(CS_WEIGHTS) as CsAttribute[])
    .reduce((sum, k) => sum + CS_WEIGHTS[k] * attrs[k], 0);
  // 权重和为 1，理论上无需再归一；保留 clamp 以防上游传入越界值
  return Math.min(1, Math.max(0, Number(raw.toFixed(4))));
}
