/**
 * Judge B —— OpenAI。
 *
 * 为什么第二个 judge 换厂商而不是换同门的更大模型：同属一个模型家族的两个
 * judge 只是不同规模，训练数据与对齐方式高度相关，判定误差不独立。跨厂商
 * 才能把「两个 judge 同时判错同一条」的相关性压下来——这一点在匹配任务上比
 * 在标注任务上更要紧，因为本管线的裁决规则是「分歧即不挂」，两个 judge 一起
 * 错成同一个答案是唯一会把错误挂载放进渲染层的路径。
 *
 * 与 Judge A 对齐的两点：
 *   ・读**同一份**判据与**同一份** JSON Schema 文件，不为某一家单独改判据
 *   ・不传 temperature，理由同 Judge A（见 anthropic.ts 的说明）
 *
 * **模型 ID 不写死。** 由 OPENAI_JUDGE_MODEL 指定，跑 `npm run annotate:models`
 * 从 API 拉当前账号可用的列表来确认。凭记忆写型号是这类脚本最常见的失效方式，
 * 而这个字段会原样进 poll-matches.json 的 meta，进而进论文——必须是核实过的。
 */

import OpenAI from 'openai';

import { readPrompt, readSchema, requireKey } from '../io';
import type { Judge, MatchInput, MatchVerdict } from '../types';
import { renderMatchInput } from './render';

/** 结构化输出里给 schema 的名字，OpenAI 侧必填。 */
const SCHEMA_NAME = 'polling_match';

function requireModel(): string {
  const model = process.env.OPENAI_JUDGE_MODEL;
  if (!model) {
    throw new Error(
      '缺少环境变量 OPENAI_JUDGE_MODEL。\n' +
        '先跑 npm run annotate:models 从 API 拉可用型号，再把选定的型号写进 .env。\n' +
        '不要凭记忆填——这个值会进 poll-matches.json 并被论文引用。',
    );
  }
  return model;
}

/**
 * OpenAI 的严格模式校验器只接受携带约束语义的关键字。
 * $schema 与 title 是元信息，剥掉再发，schema 文件本身保持完整。
 */
function toStrictSchema(schema: Record<string, unknown>): Record<string, unknown> {
  const { $schema: _dialect, title: _title, ...body } = schema;
  return body;
}

export function createOpenAIJudge(): Judge {
  const client = new OpenAI({ apiKey: requireKey('OPENAI_API_KEY') });
  const model = requireModel();
  const rubric = readPrompt();
  const schema = toStrictSchema(readSchema());

  return {
    slot: 'B',
    provider: 'openai',
    model,

    async match(input: MatchInput): Promise<MatchVerdict> {
      const completion = await client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: rubric },
          { role: 'user', content: renderMatchInput(input) },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: { name: SCHEMA_NAME, strict: true, schema },
        },
      });

      const message = completion.choices[0]?.message;
      if (message?.refusal) throw new Error(`模型拒答：${message.refusal}`);
      if (completion.choices[0]?.finish_reason === 'length') {
        throw new Error('输出被长度上限截断，JSON 不完整');
      }
      if (!message?.content) throw new Error('响应里没有内容');

      return {
        reportId: input.id,
        ...(JSON.parse(message.content) as Omit<MatchVerdict, 'reportId'>),
      };
    },
  };
}
