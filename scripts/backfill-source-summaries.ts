/**
 * 用出版方撰写的文本回填 app-data.json 的卡片标题与摘要。
 *
 * 为什么要有这一步
 * ----------------
 * 卡片上挂着真实的媒体署名与 URL。标题与摘要若出自本项目，读者看到的就是两行
 * 安在出版方名下、他们没写过的话——这是完整性问题，不是措辞问题。出版方两样
 * 都写好了：og:title 是他们挂出的标题，og:description 是他们给社交预览准备的
 * 摘要，采集脚本已从带时间戳的存档快照取回（scripts/harvest-source-texts.py）。
 *
 * 顺带解决的是另一个质疑：判定管线读的若是模型撰写的文本，那就是模型在评判
 * 模型的输出。换成出版方原文之后，**撰写文本从系统里彻底消失**——不只是判定
 * 环节没有，界面上也没有。
 *
 * 取值顺序
 * --------
 *   标题  og:title（剥掉站点后缀）→ 保留原标题
 *   摘要  og:description → 正文首段 → 保留原摘要
 *
 * 摘要那条顺序不是我们发明的，是 Open Graph 协议加上任何聚合器解析链接预览的
 * 既有顺序（实现见 annotate/lib/source-texts.ts，两条判定管线共用同一份）。
 *
 * 这个脚本**不改 URL、不改 source、不写 imageUrl**。前两者是入库时的事实认定，
 * 配图涉及版权与图注署名；三者都要人来定，脚本只把核对所需的差异摆出来。
 *
 * 用法
 *   npm run backfill:summaries            只打印将要发生的改动，不写文件
 *   npm run backfill:summaries -- --apply 核对后写回 app-data.json
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

import {
  cardSummaryOf,
  readSourceTexts,
  slotsOf,
  summaryProblems,
  tierOf,
  type InputTier,
  type SummaryProvenance,
} from './annotate/lib/source-texts';
import { PATHS } from './annotate/lib/io';
import type { AppData, Report } from '../src/types';

type TitleProvenance = 'og:title' | 'authored';

interface Decision {
  report: Report;
  tier: InputTier;
  title: string;
  titleProvenance: TitleProvenance;
  titleChanged: boolean;
  summary: string;
  summaryProvenance: SummaryProvenance;
  summaryChanged: boolean;
  /** 落选的槽位与落选原因，逐条留痕——没有这个就说不清为什么退到了下一层 */
  rejected: string[];
}

/** 站点后缀的分隔符。出版方挂 og:title 时几乎都用这几个之一接自己的名字。 */
const SEPARATORS = [' | ', ' - ', ' – ', ' — '];

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * 剥掉 og:title 末尾的站点名。
 *
 * 「California ban ... court rules | CNN」→「California ban ... court rules」
 * 「Judge blocks ... - The Texas Tribune」→「Judge blocks ...」
 *
 * 判据不是「末尾有分隔符就砍」，那会砍掉正文里本来就带破折号的标题。只有当
 * 分隔符后面那一段与该报道的 source 互相包含时才砍——「CNN Politics」含
 * 「CNN」、「U.S. Energy Information Administration (EIA)」含「EIA」都能中，
 * 而一个真正的标题尾巴不会恰好等于出版方的名字。
 */
export function stripSiteSuffix(title: string, outlet: string): string {
  const source = normalize(outlet);
  if (source.length < 3) return title.trim();

  let current = title.trim();
  for (let pass = 0; pass < 2; pass += 1) {
    let cut: string | null = null;
    for (const separator of SEPARATORS) {
      const at = current.lastIndexOf(separator);
      if (at <= 0) continue;
      const tail = normalize(current.slice(at + separator.length));
      if (tail.length < 3) continue;
      if (tail.includes(source) || source.includes(tail)) {
        cut = current.slice(0, at).trim();
        break;
      }
    }
    if (!cut) break;
    current = cut;
  }
  return current;
}

/**
 * 标题的结构性合格闸。与摘要那道同样只拦「这根本不是一行标题」，
 * 判据不含任何按本语料调出来的阈值。
 */
function titleProblems(title: string, outlet: string): string[] {
  const problems: string[] = [];
  if (title.split(/\s+/).length < 3) problems.push('不足 3 个词');
  if (normalize(title) === normalize(outlet)) problems.push('只剩出版方名字');
  return problems;
}

function decide(report: Report, texts: ReturnType<typeof readSourceTexts>): Decision {
  const record = texts[report.id];
  const slots = slotsOf(record);
  const rejected: string[] = [];

  // ── 标题 ──────────────────────────────────────────────────────────────
  let title = report.title;
  let titleProvenance: TitleProvenance = 'authored';
  const archived = record?.ogTitle?.trim();
  if (archived) {
    const stripped = stripSiteSuffix(archived, report.source);
    const problems = titleProblems(stripped, report.source);
    if (problems.length === 0) {
      title = stripped;
      titleProvenance = 'og:title';
    } else {
      rejected.push(`og:title：${problems.join('；')}`);
    }
  }

  // ── 摘要 ──────────────────────────────────────────────────────────────
  // 逐个槽位往下退，退一次记一条理由。合格闸只拦「这段文字根本不是散文」。
  // 注意用**新标题**做重复判定：换完标题后摘要才可能与它重复。
  let chosen = cardSummaryOf(slots);
  while (chosen) {
    const problems = summaryProblems(chosen.text, title);
    if (problems.length === 0) break;
    rejected.push(`${chosen.provenance}：${problems.join('；')}`);
    chosen =
      chosen.provenance === 'og:description' && slots.lede
        ? { text: slots.lede, provenance: 'lede' }
        : null;
  }
  const summary = chosen ? chosen.text : report.summary;
  const summaryProvenance: SummaryProvenance = chosen ? chosen.provenance : 'authored';

  return {
    report,
    tier: tierOf(slots),
    title,
    titleProvenance,
    titleChanged: title !== report.title || titleProvenance !== report.titleProvenance,
    summary,
    summaryProvenance,
    summaryChanged:
      summary !== report.summary || summaryProvenance !== report.summaryProvenance,
    rejected,
  };
}

function truncate(text: string, width = 96): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  return flat.length <= width ? flat : `${flat.slice(0, width - 1)}…`;
}

function tally<T extends string>(values: T[], order: T[]): string[] {
  const counts = new Map<T, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return order.filter((k) => counts.has(k)).map((k) => `  ${k.padEnd(16)} ${counts.get(k)}`);
}

function report(decisions: Decision[], texts: ReturnType<typeof readSourceTexts>): void {
  console.log(`共 ${decisions.length} 篇报道\n`);

  console.log('标题来源：');
  console.log(
    tally(
      decisions.map((d) => d.titleProvenance),
      ['og:title', 'authored'],
    ).join('\n'),
  );
  console.log('\n摘要来源：');
  console.log(
    tally(
      decisions.map((d) => d.summaryProvenance),
      ['og:description', 'lede', 'authored'],
    ).join('\n'),
  );
  console.log('\n判定输入层级（judge 读到的最深槽位）：');
  console.log(
    tally(
      decisions.map((d) => d.tier),
      ['body', 'lede', 'og', 'headline'],
    ).join('\n'),
  );

  const titleChanges = decisions.filter((d) => d.titleChanged && d.title !== d.report.title);
  console.log(`\n将改写标题 ${titleChanges.length} 篇：`);
  for (const d of titleChanges) {
    console.log(`\n  ${d.report.id}  (${d.report.source})`);
    console.log(`    旧  ${d.report.title}`);
    console.log(`    新  ${d.title}`);
  }

  const summaryChanges = decisions.filter(
    (d) => d.summaryChanged && d.summary !== d.report.summary,
  );
  console.log(`\n将改写摘要 ${summaryChanges.length} 篇：`);
  for (const d of summaryChanges) {
    console.log(`\n  ${d.report.id}  [${d.summaryProvenance}]`);
    console.log(`    旧  ${truncate(d.report.summary)}`);
    console.log(`    新  ${truncate(d.summary)}`);
  }

  const authored = decisions.filter(
    (d) => d.titleProvenance === 'authored' || d.summaryProvenance === 'authored',
  );
  if (authored.length > 0) {
    console.log(`\n⚠️ 仍含撰写文本 ${authored.length} 篇 —— 存档上没有可用的出版方文本：`);
    for (const d of authored) {
      const record = texts[d.report.id];
      const why = record?.snapshot ? '有快照但缺字段' : '存档无快照';
      const which = [
        d.titleProvenance === 'authored' ? '标题' : null,
        d.summaryProvenance === 'authored' ? '摘要' : null,
      ]
        .filter(Boolean)
        .join('+');
      console.log(`    ${d.report.id.padEnd(20)} ${which.padEnd(8)} ${why}`);
    }
    console.log('    这几条要在论文里如实报出来，不能拿别的字段充数。');
  }

  const rejected = decisions.filter((d) => d.rejected.length > 0);
  if (rejected.length > 0) {
    console.log('\n被合格闸拦下、退到下一槽位的：');
    for (const d of rejected) {
      console.log(`    ${d.report.id.padEnd(20)} ${d.rejected.join(' / ')}`);
    }
  }

  const noImage = decisions.filter((d) => !d.report.imageUrl);
  if (noImage.length > 0) {
    console.log(`\n🖼 缺配图 ${noImage.length} 篇。存档快照里抓到的 og:image：`);
    for (const d of noImage) {
      console.log(`    ${d.report.id.padEnd(20)} ${texts[d.report.id]?.ogImage ?? '(存档里也没有)'}`);
    }
    console.log('\n    本脚本**不写 imageUrl**：配图涉及版权与图注署名，要按');
    console.log('    docs/image-provenance.md 的既有流程人工过一遍再入库。');
  }
}

function apply(decisions: Decision[]): void {
  const data = JSON.parse(readFileSync(PATHS.appData, 'utf8')) as AppData;
  const byId = new Map(decisions.map((d) => [d.report.id, d]));
  let titles = 0;
  let summaries = 0;

  // 逐字段赋值而非整体替换：这个脚本只该动这四个字段，csScore 与 pollingDataId
  // 是两条管线的产出，url 与 source 是入库时的事实认定，碰一下都不行。
  for (const report of data.reports) {
    const decision = byId.get(report.id);
    if (!decision) continue;
    if (decision.titleChanged) {
      report.title = decision.title;
      report.titleProvenance = decision.titleProvenance;
      titles += 1;
    }
    if (decision.summaryChanged) {
      report.summary = decision.summary;
      report.summaryProvenance = decision.summaryProvenance;
      summaries += 1;
    }
  }

  writeFileSync(PATHS.appData, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  console.log(`\n已写回 app-data.json：标题 ${titles} 篇，摘要 ${summaries} 篇`);
}

function main(): void {
  const appData = JSON.parse(readFileSync(PATHS.appData, 'utf8')) as AppData;
  const texts = readSourceTexts();

  const missing = appData.reports.filter((r) => !texts[r.id]).map((r) => r.id);
  if (missing.length > 0) {
    throw new Error(
      `${missing.length} 篇报道在 source-texts.json 里没有对应条目：\n` +
        missing.map((id) => `  ・${id}`).join('\n') +
        '\n先跑 python scripts/harvest-source-texts.py 重新采集。',
    );
  }

  const decisions = appData.reports.map((r) => decide(r, texts));
  report(decisions, texts);

  if (process.argv.includes('--apply')) {
    apply(decisions);
  } else {
    console.log('\n未加 --apply，app-data.json 未改动。核对上面的差异后再决定。');
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
