/**
 * 标注管线的共享类型。
 *
 * 管线分三层，每层的类型在这里定义一次：
 *   ① Judge 层  —— 两个模型各自独立读同一份 rubric，产出 JudgeVerdict
 *   ② 裁决层    —— 逐属性比对两份 verdict，落到 0 / 0.5 / 1
 *   ③ 落盘层    —— AnnotationFile，既是管线的缓存，也是论文附录的来源
 *
 * 之所以把两个 judge 的原始判定完整保留而不是只存裁决结果：裁决规则是事前
 * 写定的（分歧取半分，见 src/lib/csScore.ts），任何人拿到 annotations.json
 * 都能自己重算一遍，不必信任本管线的实现。
 */

import type { CsAttribute } from '../../../src/lib/csScore';
import type { InputTier, SourceSlots } from './source-texts';

// ── ① Judge 层 ───────────────────────────────────────────────────────────

/**
 * 违背强度三分类。倒 U 形：仅 moderate 计入得分。
 * extreme 是意识形态整体反转的戏剧性个例，会触发子类型化（subtyping）而失效。
 */
export type ViolationLevel = 'none' | 'moderate' | 'extreme';

/**
 * 弃权 —— 「可得文本不足以对这个属性作判定」。
 *
 * 它是**独立于「判定为不成立」的第三种结果**，两者绝不能合并：前者说的是
 * 「读不到足以判断的东西」，后者说的是「读到了，不成立」。语料里有报道只
 * 剩标题（存档无快照），把这两件事记成同一件，等于让缺数据冒充判定结果，
 * 一致率与 csScore 分布都会因此失真。
 *
 * 每个属性**独立**可弃权，不是整条报道一起弃权。
 */
export const INSUFFICIENT = 'insufficient_evidence';
export type Insufficient = typeof INSUFFICIENT;

/** 二值属性的三种结果。yes / no 是判定，insufficient_evidence 是弃权。 */
export type BinaryJudgment = 'yes' | 'no' | Insufficient;

/**
 * 反刻板原型，对应 docs/04-Path-A-反刻板印象/设计规范.md § 3.3 的三类。
 * 不参与 csScore 计算，仅作描述性统计与人工抽查的抓手。
 */
export type Prototype = 'cross_party' | 'intra_dissent' | 'individuating' | null;

/** 二值属性的判定。evidence 必填——见 JudgeVerdict 的说明。 */
export interface AttributeJudgement {
  judgment: BinaryJudgment;
  evidence: string;
}

export interface ViolationJudgement {
  level: ViolationLevel | Insufficient;
  evidence: string;
}

/** 判定成立吗？弃权在打分上按「不成立」计——见 03-merge.ts 对 D4 的实现说明。 */
export function isSupported(judgement: AttributeJudgement): boolean {
  return judgement.judgment === 'yes';
}

export function abstained(judgement: AttributeJudgement | ViolationJudgement): boolean {
  return 'judgment' in judgement
    ? judgement.judgment === INSUFFICIENT
    : judgement.level === INSUFFICIENT;
}

/**
 * 单个 judge 对单篇报道的完整判定。
 *
 * 每个属性都要求附报道原文片段（evidence）。这不是为了好看：
 *   ・可审计——人工抽查时能直接看到判断依据，不必反推
 *   ・便于比对——两个 judge 分歧时，看引句就知道是读到了不同的地方还是同一处读法不同
 *   ・防幻觉——要求指出原文位置，比只输出布尔值更难凭空编造
 */
export interface JudgeVerdict {
  reportId: string;
  typicality: AttributeJudgement;
  heterogeneity: AttributeJudgement;
  violation: ViolationJudgement;
  prototype: Prototype;
}

/**
 * 喂给 judge 的报道内容。刻意只给 judge 需要的字段，不泄露既有标注。
 *
 * **槽位模型**：判定输入 = 标题 + 全部非空槽位。不再挑「用哪个字段」——
 * 抓到什么给什么，空的留空。两条依据：
 *   ・机制上，反刻板范例要生效的前提是感知者接触到那个范例，所以判定对象
 *     必须覆盖卡片上显示的内容。卡片显示的是 og:description（缺失退首段），
 *     判定读的是全部槽位，包含关系自动成立。
 *   ・工程上，回退顺序 og → 首段 → 仅标题 是 Open Graph 协议加聚合器解析
 *     链接预览的既有顺序，不是我们为这批数据发明的。
 */
export interface JudgeInput {
  id: string;
  title: string;
  source: string;
  /** 出版方撰写的文本。全为 null 时 judge 只能凭标题判，多半会弃权 */
  slots: SourceSlots;
  /** 最深的非空槽位。随判定一并落盘，用于分层报告一致率与弃权率 */
  tier: InputTier;
}

/**
 * Judge 适配器接口。两家厂商各实现一份，01 脚本只认这个接口。
 * provider 与 model 会原样写进 annotations.json 的 meta，作为可复现性的一部分。
 */
export interface Judge {
  readonly slot: JudgeSlot;
  readonly provider: JudgeProvider;
  /** 具体模型 ID。不加日期后缀，固定 ID 是可复现性的前提之一。 */
  readonly model: string;
  annotate(input: JudgeInput): Promise<JudgeVerdict>;
}

export type JudgeSlot = 'A' | 'B';
export type JudgeProvider = 'anthropic' | 'openai' | 'mock';

// ── ② 裁决层 ─────────────────────────────────────────────────────────────

/**
 * 单属性的一致性标记。裁决规则本身在 mergeAttribute()（03-merge.ts）。
 *
 *   'agree'           两个 judge 都作了判定且判定相同
 *   'disagree'        两个 judge 都作了判定但不同，**或**一方弃权一方判定
 *   'both_abstained'  两个 judge 都弃权
 *
 * 「一方弃权一方判定」归入 disagree 而不是单列：一个模型认为证据足够、另一个
 * 认为不够，这是真实分歧，正是信度该捕捉的东西。剔除它等于把最难的条目从
 * 考卷上划掉。'both_abstained' 则不进 κ 的分母——两边都没作判定时，没有
 * 「判定是否一致」这件事可谈——但要单独报弃权率，不能悄悄消失。
 */
export type Agreement = 'agree' | 'disagree' | 'both_abstained';

export interface MergedAnnotation {
  reportId: string;
  /** 三属性各自的 0 / 0.5 / 1，直接喂给 computeCsScore() */
  attributes: Record<CsAttribute, number>;
  agreement: Record<CsAttribute, Agreement>;
  csScore: number;
}

// ── ③ 落盘层 ─────────────────────────────────────────────────────────────

export interface JudgeRunMeta {
  slot: JudgeSlot;
  provider: JudgeProvider;
  model: string;
  ranAt: string;
}

/**
 * src/data/annotations.json 的完整形状。
 *
 * 01 写 meta.runs 与 verdicts；03 补 merged。分两步写同一个文件，是为了让
 * 「调用模型」和「裁决」这两件事在脚本层面就分开——裁决规则改了不必重跑模型。
 */
export interface AnnotationFile {
  meta: {
    /** rubric 与 schema 的内容哈希。prompt 改了而结果没重跑，这里就会对不上 */
    promptSha256: string;
    schemaSha256: string;
    /** 出版方原文的内容哈希。判定输入变了而结果没重跑，这里也会对不上 */
    sourceTextsSha256: string;
    runs: JudgeRunMeta[];
  };
  /** 逐条的输入层级。分层报告一致率与弃权率的依据，跑完即固定 */
  tiers: Record<string, InputTier>;
  /** 两个 judge 的原始判定，按 reportId 索引 */
  verdicts: Record<string, Partial<Record<JudgeSlot, JudgeVerdict>>>;
  /** 03-merge 产出；01 刚跑完时为空对象 */
  merged: Record<string, MergedAnnotation>;
}
