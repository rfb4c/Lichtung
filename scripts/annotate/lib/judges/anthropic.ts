/**
 * Judge A —— Anthropic / Claude Sonnet 5。
 *
 * 三个设计选择及其理由：
 *
 *   ・**结构化输出**（output_config.format + JSON Schema）而不是「请只输出 JSON」
 *     加提示词。模型侧被约束成必然合法的 JSON，解析重试逻辑整段不需要存在。
 *
 *   ・**不传 temperature**。Sonnet 5 这一代已经移除了采样参数，传了直接 400。
 *     连带的后果要如实写进论文：没有 temperature 也没有 seed，重跑不保证同一
 *     输出。可复现性靠「固定模型 ID + prompt/schema 入库 + 结果落盘 + 重跑
 *     差异已记录」，不能声称 deterministic。差异由 99-verify 量化。
 *
 *   ・**rubric 走 system 段并打 prompt 缓存**。rubric 是稳定前缀、报道是易变后缀，
 *     28 次调用共用同一份前缀。01 会先单独跑第一条把缓存写进去再放并发——
 *     并发首发会各自付一次全价写入，读不到彼此正在写的缓存。
 */

import Anthropic from '@anthropic-ai/sdk';

import { readPrompt, readSchema, requireKey } from '../io';
import type { Judge, JudgeInput, JudgeVerdict } from '../types';

/**
 * 固定模型 ID，不加日期后缀。这个字符串会原样写进 annotations.json 的 meta，
 * 是可复现性声明的一部分——换模型就必须重跑，不能混着用。
 */
const MODEL = 'claude-sonnet-5';

/**
 * effort 保持默认档 high：这是逐条读判据的判断任务，判定质量比省 token 重要，
 * 而 n=28 的量级下两档之间的成本差不到一美元。
 */
const EFFORT = 'high';

/** 给足思考余量。自适应思考与回答共用 max_tokens，压太紧会在思考中途截断。 */
const MAX_TOKENS = 8000;

export function renderReport(input: JudgeInput): string {
  return [
    `Outlet: ${input.source}`,
    `Headline: ${input.title}`,
    '',
    'Summary:',
    input.summary,
  ].join('\n');
}

export function createAnthropicJudge(): Judge {
  const client = new Anthropic({ apiKey: requireKey('ANTHROPIC_API_KEY') });
  const rubric = readPrompt();
  const schema = readSchema();

  return {
    slot: 'A',
    provider: 'anthropic',
    model: MODEL,

    async annotate(input: JudgeInput): Promise<JudgeVerdict> {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: [{ type: 'text', text: rubric, cache_control: { type: 'ephemeral' } }],
        thinking: { type: 'adaptive' },
        output_config: { effort: EFFORT, format: { type: 'json_schema', schema } },
        messages: [{ role: 'user', content: renderReport(input) }],
      });

      // 先看 stop_reason 再读 content：被安全分类器挡下时 content 是空的，
      // 直接取 content[0] 会拿到 undefined 而不是一个能读懂的错误。
      if (response.stop_reason === 'refusal') {
        throw new Error(`模型拒答（${response.stop_details?.category ?? '未给出类别'}）`);
      }
      if (response.stop_reason === 'max_tokens') {
        throw new Error(`输出被 max_tokens=${MAX_TOKENS} 截断，JSON 不完整`);
      }

      const text = response.content.find((block) => block.type === 'text')?.text;
      if (!text) throw new Error('响应里没有文本块');

      return { reportId: input.id, ...(JSON.parse(text) as Omit<JudgeVerdict, 'reportId'>) };
    },
  };
}
