/**
 * 报道 + 候选民调 → 喂给 judge 的用户消息。
 *
 * 两个 judge 必须看到**逐字节相同**的文本，否则一致率就掺进了「输入不同」
 * 这个混淆因素。所以渲染只有这一处实现，两家适配器都从这里取。
 *
 * 候选由 candidatesFor() 圈定并按 id 固定顺序，不在这里重排或增删。
 * 候选一律是 subtopic 级，所以不渲染 level——那个字段在这里恒为同一个值，
 * 印出来只是噪音，还会让模型去猜另一级在哪。议题级由裁决层兜底，不经模型。
 *
 * 报道侧走槽位模型，排布规则与 Path A 逐条相同（空槽位整段不出现、body 在场
 * 时不另印 lede、全空时明写「只有标题」）。两条管线必须给出同一段报道文本，
 * 否则两组一致率不可比——所以这里的分支要与 annotate/lib/judges/render.ts
 * 保持一致，改一处就要改另一处。
 */

import type { MatchInput, PollCandidate } from '../types';

function renderCandidate(poll: PollCandidate): string {
  return [
    `- id: ${poll.id}`,
    `  question: ${poll.questionWording}`,
    `  scale: ${poll.scaleLabels.join(' / ')}`,
    `  source: ${poll.source} (${poll.surveyYear})`,
  ].join('\n');
}

export function renderMatchInput(input: MatchInput): string {
  const parts = ['REPORT', `Outlet: ${input.source}`, `Headline: ${input.title}`];

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

  const candidates =
    input.candidates.length > 0
      ? input.candidates.map(renderCandidate).join('\n')
      : '(none — this issue has no polling questions on file)';

  parts.push('', 'CANDIDATE POLLING QUESTIONS', candidates);
  return parts.join('\n');
}
