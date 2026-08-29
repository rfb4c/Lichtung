import type { PollingData, Report } from '../types';
import appData from '../data/app-data.json';

const pollingLibrary = appData.pollingData as PollingData[];

/**
 * 报道 → 民调数据的唯一解析入口（Path B）。
 *
 * 挂载一律由 report.pollingDataId 显式决定，不做议题级的隐式兜底：
 * ・字符串 → 按 id 取该条民调；取不到说明数据不一致，不猜，返回 null
 * ・null / 缺失 → 这篇报道不挂图表
 *
 * "不挂"是一个有意义的状态，不是数据缺口。Path B 干预的前提是"真实分布比
 * 公众以为的更有共识"；若某个子议题的权威数据本身就呈两极分布，挂上去只会
 * 印证极化感知而不是校正它，此时正确的行为是不干预。
 */
export function resolvePollingData(report: Report): PollingData | null {
  const id = report.pollingDataId;
  if (!id) return null;

  const poll = pollingLibrary.find((p) => p.id === id);
  if (!poll) {
    console.warn(`[Path B] report ${report.id} references unknown pollingDataId "${id}"`);
    return null;
  }
  return poll;
}
