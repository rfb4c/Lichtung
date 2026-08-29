/**
 * 00 · 拉取 OpenAI 账号当前可用的模型列表。
 *
 * 存在的唯一理由：Judge B 的模型 ID 必须是从 API 核实来的，不能凭记忆写。
 * 这个字段会写进 annotations.json 的 meta 并被论文引用，写错等于论文里有一句
 * 与实际不符的系统描述。
 *
 * 选定型号后写进仓库根目录的 .env：
 *   OPENAI_JUDGE_MODEL=<从下面的列表里挑一个>
 *
 * 用法：npm run annotate:models
 */

import OpenAI from 'openai';

import { loadEnv, requireKey } from './lib/io';

async function main(): Promise<void> {
  loadEnv();
  const client = new OpenAI({ apiKey: requireKey('OPENAI_API_KEY') });

  const models: Array<{ id: string; created: number }> = [];
  for await (const model of client.models.list()) {
    models.push({ id: model.id, created: model.created });
  }

  // 按发布时间倒序：新模型排在上面，便于挑当前世代的
  models.sort((a, b) => b.created - a.created);

  console.log(`账号可用模型 ${models.length} 个（按发布时间倒序）：\n`);
  for (const model of models) {
    const date = new Date(model.created * 1000).toISOString().slice(0, 10);
    console.log(`  ${date}  ${model.id}`);
  }

  console.log(
    '\n挑一个具备结构化输出（JSON Schema / strict）能力的通用对话模型，' +
      '\n把它写进 .env：OPENAI_JUDGE_MODEL=<型号>' +
      '\n避开 embedding / tts / whisper / dall-e / moderation 这些非对话模型。',
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
