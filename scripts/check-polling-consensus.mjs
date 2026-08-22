#!/usr/bin/env node
/**
 * 逐条校验 src/data/app-data.json 里的民调：结构、入库判据、溯源字段。
 *
 * 入库判据放在**入库层**而不是检索层——库里只放共识型民调，报道→民调的检索
 * 就不必再判「这组数据是否呈共识」。判据是量化的，所以能被脚本检查，而不是
 * 靠录入时的印象：
 *
 *   把档位按方向合并成两侧（档位数为奇数时，中间档是中立档，不计入任一侧）
 *   ↓
 *   dominantShare = 占优一侧的百分比
 *   extremeMin    = min(最极端两档)
 *   ↓
 *   入库条件：dominantShare ≥ 60%  且  extremeMin < 25%
 *
 * 判据不是为了迁就现有数据定的——它必须能被现有数据通过，这个脚本就是那次回测
 * 的可重跑版本。被排除的民调存 src/data/polling-excluded.json（存在则一并校验），
 * 论文里报「共考察 N 条 / 入库 M 条 / 排除 K 条」，把 cherry-picking 质疑变成
 * 可审查的设计声明。
 *
 * 用法：node scripts/check-polling-consensus.mjs
 */

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const APP_DATA = resolve(ROOT, 'src/data/app-data.json');
const EXCLUDED = resolve(ROOT, 'src/data/polling-excluded.json');

const MIN_DOMINANT_SHARE = 60;
const MAX_EXTREME_MIN = 25;

/** 新增条目必须带齐的溯源字段。现存两条是审计之前录入的，只警告不判错。 */
const PROVENANCE_FIELDS = [
  'questionWording',
  'sourceUrl',
  'fieldDates',
  'level',
  'verifiedBy',
  'verifiedAt',
];

/**
 * 按方向把档位合并成两侧。scaleLabels 必须按方向有序（一极 → 另一极），
 * 否则这里算出来的东西没有意义——这是录入规格里的硬性规则。
 */
function consensusProfile(distribution) {
  const n = distribution.length;
  const half = Math.floor(n / 2);
  const sideA = distribution.slice(0, half).reduce((a, b) => a + b, 0);
  // 档位数为奇数时跳过中间的中立档
  const sideB = distribution.slice(n - half).reduce((a, b) => a + b, 0);

  return {
    dominantShare: Math.max(sideA, sideB),
    extremeMin: Math.min(distribution[0], distribution[n - 1]),
    neutral: n % 2 === 1 ? distribution[half] : null,
  };
}

function checkStructure(poll) {
  const problems = [];
  const { scaleLabels = [], distribution = [] } = poll;

  if (scaleLabels.length !== distribution.length) {
    problems.push(
      `scaleLabels(${scaleLabels.length}) 与 distribution(${distribution.length}) 不等长`,
    );
  }
  if (scaleLabels.length < 4 || scaleLabels.length > 7) {
    problems.push(`档位数 ${scaleLabels.length}，超出 4–7 的设计范围`);
  }

  const sum = distribution.reduce((a, b) => a + b, 0);
  if (Math.abs(sum - 100) > 1) {
    problems.push(`distribution 合计 ${sum}%，超出 100±1 的四舍五入容差`);
  }

  return problems;
}

function report(poll, { requireConsensus }) {
  const problems = checkStructure(poll);
  const { dominantShare, extremeMin, neutral } = consensusProfile(poll.distribution ?? []);
  const admissible = dominantShare >= MIN_DOMINANT_SHARE && extremeMin < MAX_EXTREME_MIN;

  if (requireConsensus && !admissible) {
    problems.push(
      `不满足入库判据：dominantShare ${dominantShare}%（需 ≥${MIN_DOMINANT_SHARE}）、` +
        `extremeMin ${extremeMin}%（需 <${MAX_EXTREME_MIN}）`,
    );
  }
  if (!requireConsensus && admissible && !poll.exclusionReason) {
    problems.push('满足入库判据却被排除，且没写 exclusionReason');
  }

  const missing = PROVENANCE_FIELDS.filter((f) => poll[f] === undefined);

  return { problems, missing, dominantShare, extremeMin, neutral, admissible };
}

function printSection(title, polls, options) {
  console.log(`\n${title}（${polls.length} 条）`);
  if (polls.length === 0) return { failed: 0, incomplete: 0 };

  let failed = 0;
  let incomplete = 0;

  for (const poll of polls) {
    const r = report(poll, options);
    const mark = r.problems.length === 0 ? '✓' : '✗';
    const neutral = r.neutral === null ? '' : `  中立档 ${r.neutral}%`;

    console.log(
      `  ${mark} ${poll.id}\n` +
        `      dominantShare ${String(r.dominantShare).padStart(3)}%   ` +
        `extremeMin ${String(r.extremeMin).padStart(3)}%${neutral}`,
    );

    for (const problem of r.problems) console.log(`      ✗ ${problem}`);
    if (r.problems.length > 0) failed += 1;

    if (r.missing.length > 0) {
      console.log(`      ⚠ 缺溯源字段：${r.missing.join(', ')}`);
      incomplete += 1;
    }
  }

  return { failed, incomplete };
}

function main() {
  const appData = JSON.parse(readFileSync(APP_DATA, 'utf8'));
  const admitted = appData.pollingData ?? [];
  const excluded = existsSync(EXCLUDED)
    ? (JSON.parse(readFileSync(EXCLUDED, 'utf8')).excluded ?? [])
    : [];

  console.log(
    `入库判据：dominantShare ≥ ${MIN_DOMINANT_SHARE}%  且  extremeMin < ${MAX_EXTREME_MIN}%`,
  );

  const a = printSection('入库', admitted, { requireConsensus: true });
  const b = printSection('排除留档', excluded, { requireConsensus: false });

  const considered = admitted.length + excluded.length;
  console.log(
    `\n共考察 ${considered} 条：入库 ${admitted.length} 条，排除 ${excluded.length} 条。`,
  );

  if (!existsSync(EXCLUDED)) {
    console.log(
      '还没有 src/data/polling-excluded.json。论文要报「考察 N / 入库 M / 排除 K」，\n' +
        '被排除的民调同样要完整留档，否则这个数字讲不出来。',
    );
  }

  const incomplete = a.incomplete + b.incomplete;
  if (incomplete > 0) {
    console.log(
      `\n${incomplete} 条缺溯源字段。现存条目是审计之前录入的，新增条目必须带齐——\n` +
        'questionWording 是检索的核心匹配对象，sourceUrl 要指向能看到这组数字的具体页面。',
    );
  }

  const failed = a.failed + b.failed;
  if (failed > 0) {
    console.error(`\n${failed} 条不合格。`);
    process.exit(1);
  }
  console.log('\n全部通过结构与判据检查。');
}

main();
