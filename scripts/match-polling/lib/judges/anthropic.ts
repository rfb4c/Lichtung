/**
 * Judge A —— Anthropic / Claude Opus 5。
 *
 * 与 Path A 的 Judge A（claude-sonnet-5）**刻意不同型号**，理由是任务性质变了：
 * 三属性标注是对单篇报道逐条打勾，这里要在一篇报道与多条候选题干之间做比较判断，
 * 且「相邻命题」是最容易出错的一类（见判据里的 tipped-wage 例子）。两条管线的
 * 型号都会原样写进各自产物的 meta，论文按管线分别声明即可，不必强行统一。
 *
 * 三个设计选择及其理由：
 *
 *   ・**结构化输出**（output_config.format + JSON Schema）而不是「请只输出 JSON」
 *     加提示词。模型侧被约束成必然合法的 JSON，解析重试逻辑整段不需要存在。
 *
 *   ・**不传 temperature**。这一代已经移除了采样参数，传了直接 400。
 *     连带的后果要如实写进论文：没有 temperature 也没有 seed，重跑不保证同一
 *     输出。可复现性靠「固定模型 ID + 判据/schema 入库 + 结果落盘」，
 *     不能声称 deterministic。
 *
 *   ・**判据走 system 段并打 prompt 缓存**。判据是稳定前缀、报道与候选是易变后缀，
 *     28 次调用共用同一份前缀。01 会先单独跑第一条把缓存写进去再放并发——
 *     并发首发会各自付一次全价写入，读不到彼此正在写的缓存。
 *     ⚠️ 可缓存前缀有最小长度（本代 512 token），判据目前约 1000–1100 token，
 *     余量尚可。若把判据大幅精简到这条线以下，缓存会**静默失效**——不报错，
 *     只是每次都按全价算。改动判据后留意 usage 里的 cache_read_input_tokens。
 */

import Anthropic from '@anthropic-ai/sdk';

import { readPrompt, readSchema, requireKey } from '../io';
import type { Judge, MatchInput, MatchVerdict } from '../types';
import { renderMatchInput } from './render';

/**
 * 固定模型 ID，不加日期后缀。这个字符串会原样写进 poll-matches.json 的 meta，
 * 是可复现性声明的一部分——换模型就必须重跑，不能混着用。
 */
const MODEL = 'claude-opus-5';

/**
 * effort 取 high：命题对齐是比较判断，判定质量比省 token 重要，
 * 而 n=28 的量级下档位之间的成本差不到一美元。
 */
const EFFORT = 'high';

/**
 * 思考与回答**共用** max_tokens。判定本身的 JSON 只有几百 token，余量全给思考；
 * 压太紧会在思考中途截断，那次调用的钱就白花了。
 */
const MAX_TOKENS = 16000;

export function createAnthropicJudge(): Judge {
  const client = new Anthropic({ apiKey: requireKey('ANTHROPIC_API_KEY') });
  const rubric = readPrompt();
  const schema = readSchema();

  return {
    slot: 'A',
    provider: 'anthropic',
    model: MODEL,

    async match(input: MatchInput): Promise<MatchVerdict> {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: [{ type: 'text', text: rubric, cache_control: { type: 'ephemeral' } }],
        thinking: { type: 'adaptive' },
        output_config: { effort: EFFORT, format: { type: 'json_schema', schema } },
        messages: [{ role: 'user', content: renderMatchInput(input) }],
      });

      // 先看 stop_reason 再读 content：被安全分类器挡下时 content 是空的，
      // 直接取 content[0] 会拿到 undefined 而不是一个能读懂的错误。
      // 语料里有枪支与堕胎议题，这条分支不是理论上的。
      if (response.stop_reason === 'refusal') {
        throw new Error(`模型拒答（${response.stop_details?.category ?? '未给出类别'}）`);
      }
      if (response.stop_reason === 'max_tokens') {
        throw new Error(`输出被 max_tokens=${MAX_TOKENS} 截断，JSON 不完整`);
      }

      const text = response.content.find((block) => block.type === 'text')?.text;
      if (!text) throw new Error('响应里没有文本块');

      return { reportId: input.id, ...(JSON.parse(text) as Omit<MatchVerdict, 'reportId'>) };
    },
  };
}
