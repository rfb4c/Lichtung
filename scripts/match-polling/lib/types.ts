/**
 * 报道 → 民调匹配管线的共享类型（Path B）。
 *
 * 与 Path A 标注管线同构，但判定对象不同：Path A 问「这篇报道具不具备某属性」，
 * 这里问「这篇报道的核心命题，是不是某条民调正在问的那件事」。
 *
 * 三层：
 *   ① Judge 层  —— 两个模型各自独立读同一份判据 + 同一批候选民调，产出 MatchVerdict
 *   ② 裁决层    —— 比对两份 verdict，落到「挂某条」或「不挂」
 *   ③ 落盘层    —— MatchFile，既是管线缓存，也是论文附录的来源
 *
 * 之所以保留两个 judge 的原始判定而不是只存裁决结果：裁决规则是事前写定的
 * （见 03-merge.ts），任何人拿到 poll-matches.json 都能自己重算一遍。
 */

import type { InputTier, SourceSlots } from '../../annotate/lib/source-texts';

// ── ① Judge 层 ───────────────────────────────────────────────────────────

/** 喂给 judge 的单条候选民调。刻意只给判定命题对齐所需的字段，不给分布数字。 */
export interface PollCandidate {
  id: string;
  /** 逐字照抄的英文原题——命题对齐判定的实际匹配对象 */
  questionWording: string;
  /** 按方向有序的档位标签，用来看清这道题在问的是哪个维度 */
  scaleLabels: string[];
  source: string;
  surveyYear: number;
}

/**
 * 喂给 judge 的输入。
 *
 * 刻意不传 report.pollingDataId ——既有的人工挂载不能污染判定，否则重评
 * 已挂的 11 篇就只是在让模型复读人工结论。同理不传 csScore 与 topic 名称。
 */
export interface MatchInput {
  id: string;
  title: string;
  source: string;
  /**
   * 出版方撰写的文本，槽位模型：抓到什么给什么，空的留空。
   * 与 Path A 共用同一份读取层（annotate/lib/source-texts），两条管线因此
   * 必然读到同一批文本——各写一份取值逻辑，迟早会漂移成两种输入。
   */
  slots: SourceSlots;
  /** 最深的非空槽位。随判定一并落盘，用于分层报告一致率与弃权率 */
  tier: InputTier;
  /**
   * 该报道所属议题下的全部 **subtopic 级**民调——即议题内部的精确命题。
   *
   * topic 级刻意不在这里。「这篇报道属不属于这个议题」的答案已经写在
   * `report.topicId` 里，让模型再判一次只是把一个已知事实交给一个会判错的
   * 东西。议题级挂载由裁决层的兜底一步确定性地完成，见 03-merge.ts。
   *
   * 空数组意味着这个议题没有精确命题可判，两个 judge 都会返回 null，
   * 随后走兜底。
   */
  candidates: PollCandidate[];
}

/**
 * 判定成立时的证据。三个字段缺一不可——
 *   ・reportSpan   报道里的哪句话
 *   ・pollConcept  对应民调题干里的哪个概念
 *   ・alignment    为什么这两者是同一件事
 * 只吐一个 id 是不可审计的：无法区分「读懂了」与「同议题就选了」。
 */
export interface MatchEvidence {
  reportSpan: string;
  pollConcept: string;
  alignment: string;
}

/**
 * 判定的三种结果。
 *
 *   'aligned'               找到命题对齐的候选
 *   'no_alignment'          读过了，没有一条候选问的是这件事
 *   'insufficient_evidence' 可得文本不足以判断核心命题是什么 —— **弃权**
 *
 * 后两者绝不能合并。「没有对齐的民调」是关于**民调库**的判断，「证据不足」
 * 是关于**这篇报道可读到多少**的判断。语料里有报道只剩标题，把两者记成
 * 同一件事，等于让缺数据冒充「模型认为不该挂」。
 */
export type MatchOutcome = 'aligned' | 'no_alignment' | 'insufficient_evidence';

export interface MatchVerdict {
  reportId: string;
  /** 判定结果。alignedPollId 非空当且仅当这里是 'aligned'，由 01 的闸保证 */
  outcome: MatchOutcome;
  /** 报道的核心命题，一句陈述句。判定的中间产物，也是人工抽查的抓手。 */
  coreClaim: string;
  /** 命题对齐的民调 id；其余两种结果下为 null */
  alignedPollId: string | null;
  evidence: MatchEvidence;
  /** 未挂载时说明最接近的候选差在哪，或说明文本为何不足；挂上时为空串 */
  rejection: string;
}

export interface Judge {
  readonly slot: JudgeSlot;
  readonly provider: JudgeProvider;
  /** 具体模型 ID。不加日期后缀，固定 ID 是可复现性的前提之一。 */
  readonly model: string;
  match(input: MatchInput): Promise<MatchVerdict>;
}

export type JudgeSlot = 'A' | 'B';
export type JudgeProvider = 'anthropic' | 'openai' | 'mock';

// ── ② 裁决层 ─────────────────────────────────────────────────────────────

/**
 * 两个 judge 在**精确层**上的一致性——只描述模型判断，不描述最终挂载。
 *
 * `agree_mount` 的判定标准是**同一个问题组**而非同一个 id：同一道题的不同年份
 * 版本（如 2024 与 2026 两条堕胎合法性民调）在命题上无法区分，让两个 judge
 * 在年份上达成一致既不可能也不必要。年份由裁决层按确定性规则挑，见 03-merge.ts。
 *
 * ⚠️ `agree_null` 与 `disagree` **不再等于「不挂」**：精确层不成立的报道会掉到
 * 兜底层，该议题若有 topic 级民调就挂上。要看挂载结果请读 `resolution`。
 *
 * 弃权按与 Path A 相同的规则并入这套标记（见 03-merge.ts 的裁决说明）：
 *   两个都弃权 → `both_abstained`，剔除出 κ 的分母，单独报弃权率
 *   一方弃权   → `disagree`，进 κ 的分母
 * 行为上三者都掉到兜底层，只在记录与统计上分开。
 */
export type MatchAgreement =
  | 'agree_mount'
  | 'agree_null'
  | 'disagree'
  | 'both_abstained';

/**
 * 挂载是从哪一层来的。与 `agreement` 分开记，因为两者不再等价。
 *
 *   'subtopic'       精确层——两个 judge 一致落在同一个问题组，模型判断的产物
 *   'topic_fallback' 兜底层——报道属于这个议题，查表得出，**不经过模型**
 *   'none'           两层都不成立：精确层没谈拢，议题也没有 topic 级民调
 *
 * 论文里的一致率与 κ 只能在**精确层**上算。兜底层不是模型判断，把它并进
 * 一致率会让数字虚高：那些报道并没有被两个 judge 判成一致，只是没被判成精确。
 */
export type MatchResolution = 'subtopic' | 'topic_fallback' | 'none';

export interface MergedMatch {
  reportId: string;
  agreement: MatchAgreement;
  /** 挂载来自哪一层。与 agreement 交叉看才能读懂这条裁决 */
  resolution: MatchResolution;
  /** 裁决产出：应挂载的民调 id；null = 不挂载 */
  pollingDataId: string | null;
  /** 挂上的那条所在的问题组；resolution 为 'none' 时为 null */
  groupKey: string | null;
  /** app-data.json 里的现状，用于产出人工可审的 diff */
  previous: string | null;
}

// ── ③ 落盘层 ─────────────────────────────────────────────────────────────

export interface JudgeRunMeta {
  slot: JudgeSlot;
  provider: JudgeProvider;
  model: string;
  ranAt: string;
}

/** src/data/poll-matches.json 的完整形状。01 写 verdicts；03 补 merged。 */
export interface MatchFile {
  meta: {
    /** 判据与 schema 的内容哈希。判据改了而结果没重跑，这里就会对不上。 */
    promptSha256: string;
    schemaSha256: string;
    /** 出版方原文的内容哈希。判定输入变了而结果没重跑，这里也会对不上 */
    sourceTextsSha256: string;
    runs: JudgeRunMeta[];
  };
  /** 逐条的输入层级。分层报告一致率与弃权率的依据，跑完即固定 */
  tiers: Record<string, InputTier>;
  verdicts: Record<string, Partial<Record<JudgeSlot, MatchVerdict>>>;
  merged: Record<string, MergedMatch>;
}
