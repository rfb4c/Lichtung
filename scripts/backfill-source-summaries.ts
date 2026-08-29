/**
 * 用出版方撰写的文本回填 app-data.json 的卡片摘要。
 *
 * 为什么要有这一步
 * ----------------
 * 卡片上挂着真实的媒体署名与 URL。摘要若出自本项目，读者看到的就是一段安在
 * 出版方名下的、我们自己写的话——这是完整性问题，不是措辞问题。出版方已经
 * 写好了：og:description 就是他们给社交预览准备的摘要，采集脚本已从带时间戳
 * 的存档快照取回（scripts/harvest-source-texts.py）。
 *
 * 顺带解决的是另一个质疑：判定管线读的若是模型撰写的文本，那就是模型在评判
 * 模型的输出。换成出版方原文之后，**撰写文本从系统里彻底消失**——不只是判定
 * 环节没有，界面上也没有。
 *
 * 取值顺序
 * --------
 *   og:description → 首段 → 保留原有撰写摘要
 *
 * 顺序本身不是我们发明的，是 Open Graph 协议加上任何聚合器解析链接预览的既有
 * 顺序（实现见 annotate/lib/source-texts.ts，两条判定管线共用同一份）。
 *
 * 这个脚本**不改标题、不改 URL、不写 imageUrl**。标题与配图是关于出版方的事实
 * 主张，改动要由人来做；脚本只把核对所需的差异摆出来。
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

interface Decision {
  report: Report;
  tier: InputTier;
  provenance: SummaryProvenance;
  summary: string;
  changed: boolean;
  /** 落选的槽位与落选原因，逐条留痕——没有这个就说不清为什么退到了下一层 */
  rejected: string[];
  /** 存档里的标题与 app-data 的标题不一致；只报告，不改 */
  titleMismatch: string | null;
}

function decide(report: Report, texts: ReturnType<typeof readSourceTexts>): Decision {
  const record = texts[report.id];
  const slots = slotsOf(record);
  const rejected: string[] = [];

  // 逐个槽位往下退，退一次记一条理由。合格闸只拦「这段文字根本不是散文」，
  // 判据是结构性的，不含任何按本语料调出来的阈值（见 source-texts.ts）。
  let chosen = cardSummaryOf(slots);
  while (chosen) {
    const problems = summaryProblems(chosen.text, report.title);
    if (problems.length === 0) break;
    rejected.push(`${chosen.provenance}：${problems.join('；')}`);
    chosen =
      chosen.provenance === 'og:description' && slots.lede
        ? { text: slots.lede, provenance: 'lede' }
        : null;
  }

  const summary = chosen ? chosen.text : report.summary;
  const provenance: SummaryProvenance = chosen ? chosen.provenance : 'authored';
  const archivedTitle = record?.ogTitle ?? null;

  return {
    report,
    tier: tierOf(slots),
    provenance,
    summary,
    changed: summary !== report.summary || provenance !== report.summaryProvenance,
    rejected,
    titleMismatch:
      archivedTitle && archivedTitle.trim() !== report.title.trim() ? archivedTitle : null,
  };
}

function truncate(text: string, width = 96): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  return flat.length <= width ? flat : `${flat.slice(0, width - 1)}…`;
}

function report(decisions: Decision[], texts: ReturnType<typeof readSourceTexts>): void {
  const byProvenance = new Map<SummaryProvenance, number>();
  const byTier = new Map<InputTier, number>();
  for (const d of decisions) {
    byProvenance.set(d.provenance, (byProvenance.get(d.provenance) ?? 0) + 1);
    byTier.set(d.tier, (byTier.get(d.tier) ?? 0) + 1);
  }

  console.log(`共 ${decisions.length} 篇报道\n`);
  console.log('摘要来源：');
  for (const key of ['og:description', 'lede', 'authored'] as SummaryProvenance[]) {
    if (byProvenance.has(key)) console.log(`  ${key.padEnd(16)} ${byProvenance.get(key)}`);
  }
  console.log('\n判定输入层级（judge 读到的最深槽位）：');
  for (const key of ['body', 'lede', 'og', 'headline'] as InputTier[]) {
    if (byTier.has(key)) console.log(`  ${key.padEnd(16)} ${byTier.get(key)}`);
  }

  const changed = decisions.filter((d) => d.changed);
  console.log(`\n将改写摘要 ${changed.length} 篇：`);
  for (const d of changed) {
    console.log(`\n  ${d.report.id}  [${d.provenance}]`);
    console.log(`    旧  ${truncate(d.report.summary)}`);
    console.log(`    新  ${truncate(d.summary)}`);
  }

  const authored = decisions.filter((d) => d.provenance === 'authored');
  if (authored.length > 0) {
    console.log(`\n⚠️ 仍是撰写摘要 ${authored.length} 篇 —— 存档上没有可用的出版方文本：`);
    for (const d of authored) {
      const record = texts[d.report.id];
      const why = record?.snapshot ? '有快照但无 og 与首段' : '存档无快照';
      console.log(`    ${d.report.id.padEnd(20)} ${why}`);
    }
    console.log('    这几条要在论文里如实报出来，不能拿标题充数当摘要。');
  }

  const rejected = decisions.filter((d) => d.rejected.length > 0);
  if (rejected.length > 0) {
    console.log('\n被合格闸拦下、退到下一槽位的：');
    for (const d of rejected) {
      console.log(`    ${d.report.id.padEnd(20)} ${d.rejected.join(' / ')}`);
    }
  }

  const mismatched = decisions.filter((d) => d.titleMismatch);
  if (mismatched.length > 0) {
    console.log(`\n📌 标题与存档快照不一致 ${mismatched.length} 篇（本脚本不改，请人工核）：`);
    for (const d of mismatched) {
      console.log(`\n  ${d.report.id}`);
      console.log(`    app-data  ${d.report.title}`);
      console.log(`    存档 og   ${d.titleMismatch}`);
    }
    console.log('\n    存档 og:title 常带站点后缀（「| CNN」「- The Texas Tribune」），');
    console.log('    那类差异无需处理；实质不同的才要改，且改的是 app-data 一侧。');
  }

  const noImage = decisions.filter((d) => !d.report.imageUrl);
  if (noImage.length > 0) {
    console.log(`\n🖼 缺配图 ${noImage.length} 篇。存档快照里抓到的 og:image：`);
    for (const d of noImage) {
      const image = texts[d.report.id]?.ogImage;
      console.log(`    ${d.report.id.padEnd(20)} ${image ?? '(存档里也没有)'}`);
    }
    console.log('\n    本脚本**不写 imageUrl**：配图涉及版权与图注署名，要按');
    console.log('    docs/image-provenance.md 的既有流程人工过一遍再入库。');
  }
}

function apply(decisions: Decision[]): void {
  const data = JSON.parse(readFileSync(PATHS.appData, 'utf8')) as AppData;
  const byId = new Map(decisions.map((d) => [d.report.id, d]));
  let updated = 0;

  // 逐字段赋值而非整体替换：这个脚本只该动 summary 与 summaryProvenance 两个
  // 字段，csScore 与 pollingDataId 是两条管线的产出，碰一下都不行。
  for (const report of data.reports) {
    const decision = byId.get(report.id);
    if (!decision || !decision.changed) continue;
    report.summary = decision.summary;
    report.summaryProvenance = decision.provenance;
    updated += 1;
  }

  writeFileSync(PATHS.appData, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  console.log(`\n已写回 app-data.json：${updated} 篇报道的 summary 与 summaryProvenance`);
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
