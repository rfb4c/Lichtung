/**
 * 报道 + 候选民调 → 喂给 judge 的用户消息。
 *
 * 两个 judge 必须看到**逐字节相同**的文本，否则一致率就掺进了「输入不同」
 * 这个混淆因素。所以渲染只有这一处实现，两家适配器都从这里取。
 *
 * 候选由 candidatesFor() 圈定并按 id 固定顺序，不在这里重排或增删。
 * 候选一律是 subtopic 级，所以不渲染 level——那个字段在这里恒为同一个值，
 * 印出来只是噪音，还会让模型去猜另一级在哪。议题级由裁决层兜底，不经模型。
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
  const candidates =
    input.candidates.length > 0
      ? input.candidates.map(renderCandidate).join('\n')
      : '(none — this issue has no polling questions on file)';

  return [
    'REPORT',
    `Outlet: ${input.source}`,
    `Headline: ${input.title}`,
    '',
    'Summary:',
    input.summary,
    '',
    'CANDIDATE POLLING QUESTIONS',
    candidates,
  ].join('\n');
}
