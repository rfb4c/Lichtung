/**
 * 报道 → 喂给 judge 的用户消息。
 *
 * 两个 judge 必须看到**逐字节相同**的报道文本，否则一致率就掺进了「输入不同」
 * 这个混淆因素。所以渲染只有这一处实现，两家适配器都从这里取。
 *
 * 槽位怎么排布：
 *
 *   ・**空槽位整段不出现**，不打印 "(none)"。给模型看一个写着「这里没有」的
 *     标题，是在请它对着空白发挥；直接不给，它才会照弃权指令办。
 *   ・**body 在场时不另印 lede**。lede 是 body 的第一段（见采集脚本），两个
 *     都印等于把同一段话喂两遍——既费 token，也会让模型误以为开头那段被
 *     强调了。lede 单独成段只发生在正文缺失、只抓到首段的情况。
 *   ・**全空时明写「只有标题」**。这是语料里真实存在的一层（存档无快照），
 *     模型必须知道自己看到的就是全部，而不是被截断了。
 */

import type { JudgeInput } from '../types';

export function renderReport(input: JudgeInput): string {
  const parts = [`Outlet: ${input.source}`, `Headline: ${input.title}`];

  if (input.slots.ogDescription) {
    parts.push('', "Publisher's own summary:", input.slots.ogDescription);
  }

  if (input.slots.body) {
    parts.push('', 'Article text, as archived:', input.slots.body);
  } else if (input.slots.lede) {
    parts.push('', 'Opening paragraph, as archived:', input.slots.lede);
  }

  if (!input.slots.ogDescription && !input.slots.body && !input.slots.lede) {
    parts.push(
      '',
      'No archived article text is available for this report. The headline above is ' +
        'the entire text you have.',
    );
  }

  return parts.join('\n');
}
