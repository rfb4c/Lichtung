/**
 * 报道 + 候选民调 → 喂给 judge 的用户消息。
 *
 * 两个 judge 必须看到**逐字节相同**的文本，否则一致率就掺进了「输入不同」
 * 这个混淆因素。所以渲染只有这一处实现，两家适配器都从这里取。
 *
 * 候选顺序由 candidatesFor() 固定（subtopic 在前、同级按 id），不在这里重排。
 */

import type { MatchInput, PollCandidate } from '../types';

function renderCandidate(poll: PollCandidate): string {
  return [
    `- id: ${poll.id}`,
    `  level: ${poll.level}`,
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
