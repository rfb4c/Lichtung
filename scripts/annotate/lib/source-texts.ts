/**
 * 出版方原文槽位 —— 两条管线与回填脚本共用的读取层。
 *
 * 这个模块存在的理由，是把「judge 读到什么」和「卡片显示什么」收在同一处定义。
 * 两者必须满足一个包含关系：**judge 输入 ⊇ 卡片内容**。卡片显示的是出版方
 * 撰写的摘要（og:description，缺失则退到首段），judge 读的是标题加上全部非空
 * 槽位——后者天然覆盖前者。若这两处各写一份取值逻辑，包含关系迟早会在某次
 * 改动里悄悄破掉，而破掉之后从产物上完全看不出来。
 *
 * 槽位模型（而不是「用哪个字段」的二选一）：抓到什么填什么，空的留空。
 * 输入深度因此是被记录的结果，不是预先设定的档位——哪些槽位非空就是哪一层。
 *
 * 这里**不做任何文本清洗**。清洗只在采集端做一次（scripts/harvest-source-texts.py），
 * 否则同一段导航栏文字会在采集端与读取端各被处理一次，谁也说不清最终喂给
 * 模型的是哪一版。
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '../../..');

export const SOURCE_TEXTS_PATH = resolve(REPO_ROOT, 'src/data/source-texts.json');

/** scripts/harvest-source-texts.py 的产物，字段与该脚本一一对应。 */
export interface SourceRecord {
  url: string | null;
  source: string | null;
  /** Wayback 原样快照（id_ 形式，不带存档站自身的导航注入） */
  snapshot: string | null;
  /** 14 位快照时间戳，溯源声明引用的就是它 */
  snapshotAt: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  lede: string | null;
  body: string | null;
  paragraphCount: number;
  bodyWords: number;
  harvestedAt: string;
  /** 采集端剔除的站点样板段落，留痕用；不参与任何判定 */
  dropped?: string[];
  error?: string;
}

/** 喂给 judge 的三个槽位。空槽位一律是 null，不是空串。 */
export interface SourceSlots {
  ogDescription: string | null;
  lede: string | null;
  body: string | null;
}

/**
 * 输入层级 —— 该报道最深的那个非空槽位。
 *
 * 这是**事后记录的结果**，不是事前设定的门槛：判定规则里没有一个数字来自
 * 本语料的覆盖率。论文按这一层分层报告一致率与弃权率。
 */
export type InputTier = 'body' | 'lede' | 'og' | 'headline';

export type SourceTexts = Record<string, SourceRecord>;

export function readSourceTexts(path: string = SOURCE_TEXTS_PATH): SourceTexts {
  if (!existsSync(path)) {
    throw new Error(
      `找不到 ${path}。先跑 python scripts/harvest-source-texts.py <输出路径> 采集出版方原文。`,
    );
  }
  return JSON.parse(readFileSync(path, 'utf8')) as SourceTexts;
}

/** 空串与全空白一律归一成 null——「有这个字段但里面什么都没有」不是一个槽位。 */
function nonEmpty(value: string | null | undefined): string | null {
  const trimmed = (value ?? '').trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function slotsOf(record: SourceRecord | undefined): SourceSlots {
  return {
    ogDescription: nonEmpty(record?.ogDescription),
    lede: nonEmpty(record?.lede),
    body: nonEmpty(record?.body),
  };
}

export function tierOf(slots: SourceSlots): InputTier {
  if (slots.body) return 'body';
  if (slots.lede) return 'lede';
  if (slots.ogDescription) return 'og';
  return 'headline';
}

/** 卡片摘要的来源。'authored' = 两个槽位都没有，保留原有的人工撰写摘要。 */
export type SummaryProvenance = 'og:description' | 'lede' | 'authored';

export interface CardSummary {
  text: string;
  provenance: Exclude<SummaryProvenance, 'authored'>;
}

/**
 * 卡片摘要的取值顺序：og:description → 首段。
 *
 * 这个顺序不是我们发明的，是 Open Graph 协议加上任何聚合器解析链接预览时
 * 的既有顺序。换一份完全不同的语料，同一条规则照跑——所以它可以写进论文的
 * 方法段而不必附带本语料的统计。
 *
 * 两个槽位都没有时返回 null，调用方保留原有的撰写摘要并在证据里标出，
 * 不许拿标题充数：把标题复制一份当摘要，读者看到的是同一句话两遍。
 */
export function cardSummaryOf(slots: SourceSlots): CardSummary | null {
  if (slots.ogDescription) return { text: slots.ogDescription, provenance: 'og:description' };
  if (slots.lede) return { text: slots.lede, provenance: 'lede' };
  return null;
}

/**
 * 摘要的结构性合格闸。
 *
 * 只拦「这段文字根本不是散文」这一类事故——采集端漏网的导航栏、栏目列表、
 * 一个孤零零的词组。**三条判据都是结构性的，不含任何按本语料调出来的阈值**：
 *
 *   ・至少要有一个句末标点，否则它是一串标签而不是一句话
 *   ・至少 8 个词，短于此的 og 是站点标语（"With a few conditions."）而非摘要
 *   ・不与标题逐字相同，否则卡片上同一句话会出现两遍
 *
 * 拦下来不等于判错，等于「这条要人看一眼」——回填脚本会把它单列出来，
 * 由人决定退到下一个槽位还是保留撰写摘要。
 */
export function summaryProblems(text: string, title: string): string[] {
  const problems: string[] = [];
  if (!/[.!?]/.test(text)) problems.push('没有句末标点，疑似栏目/导航文字');
  if (text.split(/\s+/).length < 8) problems.push('不足 8 个词，疑似站点标语');
  if (text.trim().toLowerCase() === title.trim().toLowerCase()) problems.push('与标题逐字相同');
  return problems;
}
