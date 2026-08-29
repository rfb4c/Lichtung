/**
 * 报道 → 喂给 judge 的用户消息。
 *
 * 两个 judge 必须看到**逐字节相同**的报道文本，否则一致率就掺进了「输入不同」
 * 这个混淆因素。所以渲染只有这一处实现，两家适配器都从这里取。
 */

import type { JudgeInput } from '../types';

export function renderReport(input: JudgeInput): string {
  return [
    `Outlet: ${input.source}`,
    `Headline: ${input.title}`,
    '',
    'Summary:',
    input.summary,
  ].join('\n');
}
