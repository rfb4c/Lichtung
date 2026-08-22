/**
 * 01 · Path A 三属性标注 —— 两个 judge 各自独立跑同一份 rubric。
 *
 * 只做一件事：调用模型、把原始判定原样落进 src/data/annotations.json。
 * 不做裁决、不算 csScore、不碰 app-data.json——那是 03-merge 的事。
 * 分开的理由：裁决规则改了，不必重新花钱跑模型。
 *
 * 用法
 *   npm run annotate:mock          假 judge，不联网，验证管线本身
 *   npm run annotate               实跑（需要两把密钥）
 *   npm run annotate -- --resume   只补跑缺失的条目（中途失败后省钱）
 *   npm run annotate -- --limit 3  只跑前 3 篇，冒烟用
 */

import { pathToFileURL } from 'node:url';

import {
  PATHS,
  loadEnv,
  readAnnotations,
  readAppData,
  readPrompt,
  readSchema,
  sha256,
  toJudgeInputs,
  writeAnnotations,
} from './lib/io';
import { createMockJudge } from './lib/judges/mock';
import type {
  AnnotationFile,
  Judge,
  JudgeInput,
  JudgeSlot,
  JudgeVerdict,
} from './lib/types';

export interface AnnotateOptions {
  /** mock = 不联网的假 judge；real = 两家厂商的实际模型 */
  judges: 'real' | 'mock';
  /** 落盘路径。99-verify 会指向临时文件，以免覆盖已提交的结果 */
  outPath: string;
  /** 只跑前 N 篇 */
  limit?: number;
  /** 跳过已有判定的条目 */
  resume: boolean;
  quiet: boolean;
}

/** 并发上限。第一条单独跑完再放开，让 prompt 缓存先写进去。 */
const CONCURRENCY = 3;

function log(options: AnnotateOptions, message: string): void {
  if (!options.quiet) console.log(message);
}

async function createJudges(mode: 'real' | 'mock'): Promise<Judge[]> {
  if (mode === 'mock') {
    return [createMockJudge('A'), createMockJudge('B')];
  }
  // 动态引入：mock 路径不该因为厂商 SDK 有问题而跑不起来
  const [{ createAnthropicJudge }, { createOpenAIJudge }] = await Promise.all([
    import('./lib/judges/anthropic'),
    import('./lib/judges/openai'),
  ]);
  return [createAnthropicJudge(), createOpenAIJudge()];
}

/** 读回已有结果用于 --resume；文件不存在就从空开始。 */
function loadExisting(resume: boolean, path: string): AnnotationFile['verdicts'] {
  if (!resume) return {};
  try {
    return readAnnotations(path).verdicts;
  } catch {
    return {};
  }
}

interface Task {
  judge: Judge;
  input: JudgeInput;
}

/** 定并发跑任务，失败不中断整批——已花的钱要留下结果。 */
async function runPool(
  tasks: Task[],
  concurrency: number,
  onDone: (task: Task, verdict: JudgeVerdict | null, error?: unknown) => void,
): Promise<void> {
  let cursor = 0;
  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, async () => {
    while (cursor < tasks.length) {
      const task = tasks[cursor++];
      try {
        onDone(task, await task.judge.annotate(task.input));
      } catch (error) {
        onDone(task, null, error);
      }
    }
  });
  await Promise.all(workers);
}

export async function runAnnotation(options: AnnotateOptions): Promise<AnnotationFile> {
  loadEnv();

  const prompt = readPrompt();
  const schema = readSchema();
  const appData = readAppData();
  const inputs = toJudgeInputs(appData).slice(0, options.limit ?? undefined);
  const judges = await createJudges(options.judges);

  const file: AnnotationFile = {
    meta: {
      promptSha256: sha256(prompt),
      schemaSha256: sha256(JSON.stringify(schema)),
      runs: judges.map((j) => ({
        slot: j.slot,
        provider: j.provider,
        model: j.model,
        ranAt: new Date().toISOString(),
      })),
    },
    verdicts: loadExisting(options.resume, options.outPath),
    merged: {},
  };

  const pending: Task[] = [];
  for (const input of inputs) {
    for (const judge of judges) {
      if (options.resume && file.verdicts[input.id]?.[judge.slot]) continue;
      pending.push({ judge, input });
    }
  }

  log(
    options,
    `标注 ${inputs.length} 篇 × ${judges.length} 个 judge，待跑 ${pending.length} 次调用\n` +
      judges.map((j) => `  Judge ${j.slot}: ${j.provider} / ${j.model}`).join('\n'),
  );

  const failures: Array<{ id: string; slot: JudgeSlot; error: unknown }> = [];
  let completed = 0;

  const record = (task: Task, verdict: JudgeVerdict | null, error?: unknown): void => {
    completed += 1;
    if (!verdict) {
      failures.push({ id: task.input.id, slot: task.judge.slot, error });
      log(options, `  [${completed}/${pending.length}] ✗ ${task.input.id} (Judge ${task.judge.slot})`);
      return;
    }
    (file.verdicts[task.input.id] ??= {})[task.judge.slot] = verdict;
    log(options, `  [${completed}/${pending.length}] ✓ ${task.input.id} (Judge ${task.judge.slot})`);
  };

  // 第一次调用单独跑：rubric 作为稳定前缀写进 prompt 缓存后，
  // 后面并发的调用才读得到缓存。并发首发会各自付一次全价写入。
  if (pending.length > 0) {
    const [first, ...rest] = pending;
    await runPool([first], 1, record);
    await runPool(rest, CONCURRENCY, record);
  }

  writeAnnotations(file, options.outPath);
  log(options, `\n已写入 ${options.outPath}`);

  if (failures.length > 0) {
    console.error(`\n${failures.length} 次调用失败：`);
    for (const f of failures) {
      console.error(`  ${f.id} / Judge ${f.slot}: ${(f.error as Error)?.message ?? f.error}`);
    }
    console.error('用 --resume 重跑，只会补这些条目。');
  }

  return file;
}

function parseArgs(argv: string[]): AnnotateOptions {
  const judgesFlag = argv[argv.indexOf('--judges') + 1];
  const limitFlag = argv.includes('--limit')
    ? Number(argv[argv.indexOf('--limit') + 1])
    : undefined;

  return {
    judges: argv.includes('--judges') && judgesFlag === 'mock' ? 'mock' : 'real',
    outPath: PATHS.annotations,
    limit: Number.isFinite(limitFlag) ? limitFlag : undefined,
    resume: argv.includes('--resume'),
    quiet: false,
  };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const options = parseArgs(process.argv.slice(2));
  runAnnotation(options).catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
