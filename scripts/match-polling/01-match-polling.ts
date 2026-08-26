/**
 * 01 · Path B 报道→民调匹配 —— 两个 judge 各自独立跑同一份判据。
 *
 * 只做一件事：调用模型、把原始判定原样落进 src/data/poll-matches.json。
 * 不做裁决、不碰 app-data.json——那是 03-merge 的事。
 * 分开的理由：裁决规则改了，不必重新花钱跑模型。
 *
 * 用法
 *   npm run match:mock          假 judge，不联网，验证管线本身
 *   npm run match               实跑（需要两把密钥）
 *   npm run match -- --resume   只补跑缺失的条目（中途失败后省钱）
 *   npm run match -- --limit 3  只跑前 3 篇，冒烟用
 */

import { pathToFileURL } from 'node:url';

import {
  PATHS,
  loadEnv,
  readAppData,
  readMatches,
  readPrompt,
  readSchema,
  sha256,
  toMatchInputs,
  writeMatches,
} from './lib/io';
import { createMockJudge } from './lib/judges/mock';
import type { Judge, JudgeSlot, MatchFile, MatchInput, MatchVerdict } from './lib/types';

export interface MatchOptions {
  /** mock = 不联网的假 judge；real = 两家厂商的实际模型 */
  judges: 'real' | 'mock';
  /** 落盘路径。复现校验会指向临时文件，以免覆盖已提交的结果 */
  outPath: string;
  /** 只跑前 N 篇 */
  limit?: number;
  /** 跳过已有判定的条目 */
  resume: boolean;
  quiet: boolean;
}

/** 并发上限。第一条单独跑完再放开，让 prompt 缓存先写进去。 */
const CONCURRENCY = 3;

function log(options: MatchOptions, message: string): void {
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

function loadExisting(resume: boolean, path: string): MatchFile | null {
  if (!resume) return null;
  try {
    return readMatches(path);
  } catch {
    return null;
  }
}

/**
 * --resume 的完整性守卫。
 *
 * 断点续跑最容易出的事故是把两份不同来源的判定混进同一个文件：改了判据再续跑、
 * 换了 OPENAI_JUDGE_MODEL 再续跑——产出的文件一半来自配置 X、一半来自配置 Y，
 * 而 meta 只记得住后一个。作为审计层这就废了，且从文件本身看不出来。
 * 所以宁可拒绝续跑。
 */
function assertResumable(
  previous: MatchFile,
  next: MatchFile['meta'],
  path: string,
): void {
  const problems: string[] = [];

  if (previous.meta.promptSha256 !== next.promptSha256) {
    problems.push('判据 prompts/path-b-match.md 已改动');
  }
  if (previous.meta.schemaSha256 !== next.schemaSha256) {
    problems.push('schemas/poll-match.json 已改动');
  }
  for (const run of next.runs) {
    const before = previous.meta.runs.find((r) => r.slot === run.slot);
    if (!before) continue;
    if (before.provider !== run.provider || before.model !== run.model) {
      problems.push(
        `Judge ${run.slot} 的模型变了：` +
          `${before.provider}/${before.model} → ${run.provider}/${run.model}`,
      );
    }
  }

  if (problems.length > 0) {
    throw new Error(
      '不能续跑，已有判定与当前配置不一致：\n' +
        problems.map((p) => `  ・${p}`).join('\n') +
        '\n续跑会把两份不同来源的判定混进同一个文件，而 meta 只记得住后一个。' +
        `\n要么恢复原配置，要么删掉 ${path} 整体重跑。`,
    );
  }
}

/**
 * 候选清单是逐篇不同的，schema 无法约束「id 必须在候选里」。
 * 编出来的 id 会一路流到 pollingDataId，在前端变成一条查不到的引用——
 * resolvePollingData 会 warn 然后返回 null，图表静默消失。宁可当调用失败。
 */
function assertOfferedId(verdict: MatchVerdict, input: MatchInput): void {
  if (verdict.alignedPollId === null) return;
  const offered = input.candidates.map((c) => c.id);
  if (!offered.includes(verdict.alignedPollId)) {
    throw new Error(
      `判定给出的 alignedPollId「${verdict.alignedPollId}」不在候选里` +
        `（候选：${offered.join(', ') || '空'}）`,
    );
  }
}

interface Task {
  judge: Judge;
  input: MatchInput;
}

/** 定并发跑任务，失败不中断整批——已花的钱要留下结果。 */
async function runPool(
  tasks: Task[],
  concurrency: number,
  onDone: (task: Task, verdict: MatchVerdict | null, error?: unknown) => void,
): Promise<void> {
  let cursor = 0;
  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, async () => {
    while (cursor < tasks.length) {
      const task = tasks[cursor++];
      try {
        const verdict = await task.judge.match(task.input);
        assertOfferedId(verdict, task.input);
        onDone(task, verdict);
      } catch (error) {
        onDone(task, null, error);
      }
    }
  });
  await Promise.all(workers);
}

export interface MatchResult {
  file: MatchFile;
  /** 失败的调用次数。>0 时 CLI 退出码为 1，避免用半份数据接着跑 merge */
  failures: number;
}

export async function runMatching(options: MatchOptions): Promise<MatchResult> {
  loadEnv();

  const prompt = readPrompt();
  const schema = readSchema();
  const appData = readAppData();
  const inputs = toMatchInputs(appData).slice(0, options.limit ?? undefined);
  const judges = await createJudges(options.judges);

  const meta: MatchFile['meta'] = {
    promptSha256: sha256(prompt),
    schemaSha256: sha256(JSON.stringify(schema)),
    runs: judges.map((j) => ({
      slot: j.slot,
      provider: j.provider,
      model: j.model,
      ranAt: new Date().toISOString(),
    })),
  };

  const previous = loadExisting(options.resume, options.outPath);
  if (previous) assertResumable(previous, meta, options.outPath);

  // merged 一律清空：新判定进来，旧裁决就是过期的，必须重跑 03-merge
  const file: MatchFile = { meta, verdicts: previous?.verdicts ?? {}, merged: {} };

  const pending: Task[] = [];
  for (const input of inputs) {
    for (const judge of judges) {
      if (options.resume && file.verdicts[input.id]?.[judge.slot]) continue;
      pending.push({ judge, input });
    }
  }

  log(
    options,
    `匹配 ${inputs.length} 篇 × ${judges.length} 个 judge，待跑 ${pending.length} 次调用\n` +
      judges.map((j) => `  Judge ${j.slot}: ${j.provider} / ${j.model}`).join('\n'),
  );

  const failures: Array<{ id: string; slot: JudgeSlot; error: unknown }> = [];
  let completed = 0;

  const record = (task: Task, verdict: MatchVerdict | null, error?: unknown): void => {
    completed += 1;
    const tag = `[${completed}/${pending.length}]`;
    if (!verdict) {
      failures.push({ id: task.input.id, slot: task.judge.slot, error });
      log(options, `  ${tag} ✗ ${task.input.id} (Judge ${task.judge.slot})`);
      return;
    }
    (file.verdicts[task.input.id] ??= {})[task.judge.slot] = verdict;
    const shown = verdict.alignedPollId ?? '不挂';
    log(options, `  ${tag} ✓ ${task.input.id} (Judge ${task.judge.slot}) → ${shown}`);
  };

  const reportFailures = (): void => {
    console.error(`\n${failures.length} 次调用失败：`);
    for (const f of failures) {
      console.error(`  ${f.id} / Judge ${f.slot}: ${(f.error as Error)?.message ?? f.error}`);
    }
  };

  // 每个 judge 的第一次调用先单独跑，两家并行——一举两得：
  //   ・缓存：判据作为稳定前缀先写进各自的 prompt 缓存，后面并发的调用才读得到
  //   ・冒烟：密钥错、模型 ID 错、schema 被某一家拒绝——这类问题必然在第一次
  //     调用就暴露。不先探一下就放并发，等来的是 56 条一模一样的报错
  const probes = judges
    .map((judge) => pending.find((t) => t.judge.slot === judge.slot))
    .filter((task): task is Task => task !== undefined);
  const rest = pending.filter((task) => !probes.includes(task));

  await runPool(probes, probes.length, record);

  if (failures.length > 0) {
    // 首发就失败，几乎必然是配置问题。已成功的那一侧照样落盘，--resume 不会白跑
    writeMatches(file, options.outPath);
    reportFailures();
    console.error(
      '\n首次调用即失败，判断为配置问题，已中止——不继续把剩余调用打出去。\n' +
        '修好后用 --resume 继续，已成功的条目不会重跑。',
    );
    return { file, failures: failures.length };
  }

  await runPool(rest, CONCURRENCY, record);

  writeMatches(file, options.outPath);
  log(options, `\n已写入 ${options.outPath}`);

  if (failures.length > 0) {
    reportFailures();
    console.error('用 --resume 重跑，只会补这些条目。');
  }

  return { file, failures: failures.length };
}

/**
 * --judges 拼错时**不能**默默回落到实跑：那会直接开始花钱。
 * 这个标志是「花钱 / 不花钱」的开关，必须精确匹配。
 */
function parseJudges(argv: string[]): 'real' | 'mock' {
  const index = argv.indexOf('--judges');
  if (index === -1) return 'real';

  const value = argv[index + 1];
  if (value === 'mock' || value === 'real') return value;

  throw new Error(
    `--judges 只接受 mock 或 real，收到「${value ?? '(空)'}」。\n` +
      '不默认回落到 real——拼错一个字母就开始花钱，这个代价不该由拼写承担。',
  );
}

function parseArgs(argv: string[]): MatchOptions {
  const limitFlag = argv.includes('--limit')
    ? Number(argv[argv.indexOf('--limit') + 1])
    : undefined;

  return {
    judges: parseJudges(argv),
    outPath: PATHS.matches,
    limit: Number.isFinite(limitFlag) ? limitFlag : undefined,
    resume: argv.includes('--resume'),
    quiet: false,
  };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  // parseArgs 会因为参数拼错而抛，所以它也要在 try 里——否则用户看到的是
  // 一屏堆栈，而不是我们精心写的那句「拼错一个字母就开始花钱」。
  const fail = (error: unknown): never => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  };
  try {
    runMatching(parseArgs(process.argv.slice(2)))
      // 有失败就以非零退出：链式跑 `match && merge` 时，
      // 不能让半份判定悄悄流进裁决
      .then(({ failures }) => {
        if (failures > 0) process.exitCode = 1;
      })
      .catch(fail);
  } catch (error) {
    fail(error);
  }
}
