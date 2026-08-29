import type { Report } from '../types';

export type FeedMode = 'algorithm' | 'calibrated';

/**
 * 提升幅度系数：位移量 = 报道总数 × 0.3 × csScore。
 *
 * 这里前移的是**距离**，不是目标位置——满分报道前移相当于列表长度 30% 的距离，
 * 并不保证进入前 30%。起点过于靠后的报道挪满也进不了头部（实测 rp_gun_004
 * 第 27 位 → 前移 8 格 → 第 19 位，而前 30% 是第 0–8 位）。这是有意的：
 * 参与度本就很低的内容不应因单个标注冲到 Feed 顶部。
 *
 * 无文献依据，是工程取值，属敏感性分析对象。判据与取值见
 * docs/04-Path-A-反刻板印象/设计规范.md § 4.3。
 *
 * 导出是为了让标注管线的汇总输出算位移档位时取同一个值，避免两处漂移。
 */
export const BOOST_FACTOR = 0.3;

/** 窗口保底：每连续 WINDOW 条至少出现 1 条反刻板报道 */
const WINDOW = 4;

/** 计入窗口保底的门槛。同为工程取值。 */
const FLOOR_THRESHOLD = 0.5;

/**
 * 取报道的反刻板得分。
 * 管线产出 csScore 之前，回退到旧的二值标注，使零配置克隆行为不依赖管线是否跑过。
 */
function csScoreOf(r: Report): number {
  if (typeof r.csScore === 'number') return r.csScore;
  return r.counterStereotypical ? 1 : 0;
}

/** 对照条件：复现参与度驱动的排序 */
export function sortAlgorithm(reports: Report[]): Report[] {
  return [...reports].sort((a, b) =>
    (b.engagementScore ?? 0.5) - (a.engagementScore ?? 0.5)
  );
}

/**
 * 干预条件：在参与度排序的基础上，按 csScore 连续前移反刻板报道，
 * 再用窗口保底防止它们在数量不足时被挤到 Feed 末尾。
 *
 * 之所以在 Algorithm 顺序之上做位移而不是另起一套排序：干预要改变的是
 * 用户接触到的样本结构，参与度信号本身应当保留——两种条件的差异因此
 * 完全归因于干预，而不是换了个排序依据。
 */
export function sortCalibrated(reports: Report[]): Report[] {
  const base = sortAlgorithm(reports);
  const n = base.length;

  const shifted = base
    .map((report, position) => ({
      report,
      position,
      key: position - Math.round(n * BOOST_FACTOR * csScoreOf(report)),
    }))
    // key 相同时按原位置决胜，保证排序稳定、结果可复现
    .sort((a, b) => a.key - b.key || a.position - b.position)
    .map((x) => x.report);

  return enforceSpacing(shifted);
}

/**
 * 让反刻板报道在 Feed 中保持分散，兼顾两侧：
 *
 *   下界（保底）——已连续放置 WINDOW-1 条非反刻板时，强制从后方提一条上来，
 *                 防止它们在数量不足时被挤到末尾。
 *   上界（反聚簇）——上一条已是反刻板且仍有非反刻板可放时，优先放非反刻板，
 *                 避免它们成簇。成簇会在前段耗尽预算、导致后段长时间断档，
 *                 而剂量证据表明分散、温和、重复的暴露优于少数震撼个例。
 *
 * 两条规则合起来使相邻反刻板报道的间隔落在 1–3 条之间。
 *
 * 保证的不变式（只到这一步，不多声称）：
 *   **在最后一条反刻板报道之前，任意连续 WINDOW 条中至少有 1 条反刻板报道。**
 * 反刻板报道全部放置完毕后，尾部是剩余的非反刻板报道，此时窗口条件无法继续满足——
 * 这是数量约束的必然结果（当前 9/28），不是缺陷：要让全表都满足就得按固定间隔配位，
 * 那会完全覆盖 csScore 的排序结果，等于取消干预本身。
 * 由此得到的性质是干预强度在 Feed 头部最高、向尾部递减，与提升至用户自然浏览范围内一致。
 */
function enforceSpacing(list: Report[]): Report[] {
  const isCs = (r: Report) => csScoreOf(r) >= FLOOR_THRESHOLD;
  const pending = [...list];
  const out: Report[] = [];
  let sinceLastCs = Number.POSITIVE_INFINITY; // 开头不受反聚簇约束

  while (pending.length > 0) {
    let idx = 0;
    if (sinceLastCs >= WINDOW - 1) {
      const found = pending.findIndex(isCs);
      if (found > 0) idx = found;
    } else if (sinceLastCs === 0 && isCs(pending[0])) {
      const found = pending.findIndex((r) => !isCs(r));
      if (found > 0) idx = found;
    }
    const [picked] = pending.splice(idx, 1);
    out.push(picked);
    sinceLastCs = isCs(picked) ? 0 : sinceLastCs + 1;
  }
  return out;
}
