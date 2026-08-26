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

// ── ① Judge 层 ───────────────────────────────────────────────────────────

/** 喂给 judge 的单条候选民调。刻意只给判定命题对齐所需的字段，不给分布数字。 */
export interface PollCandidate {
  id: string;
  /** 'subtopic' 是精确命题，'topic' 是议题广义命题。两级回退的依据。 */
  level: 'topic' | 'subtopic';
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
  summary: string;
  source: string;
  /** 该报道所属议题下的全部民调。空数组意味着这个议题没有可挂的东西。 */
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

export interface MatchVerdict {
  reportId: string;
  /** 报道的核心命题，一句陈述句。判定的中间产物，也是人工抽查的抓手。 */
  coreClaim: string;
  /** 命题对齐的民调 id；不成立时 null——「不挂」是有意义的答案，不是缺口 */
  alignedPollId: string | null;
  evidence: MatchEvidence;
  /** alignedPollId 为 null 时说明最接近的候选差在哪；成立时为空串 */
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
 * 两个 judge 的一致性。
 *
 * `agree_mount` 的判定标准是**同一个问题组**而非同一个 id：同一道题的不同年份
 * 版本（如 2024 与 2026 两条堕胎合法性民调）在命题上无法区分，让两个 judge
 * 在年份上达成一致既不可能也不必要。年份由裁决层按确定性规则挑，见 03-merge.ts。
 */
export type MatchAgreement = 'agree_mount' | 'agree_null' | 'disagree';

export interface MergedMatch {
  reportId: string;
  agreement: MatchAgreement;
  /** 裁决产出：应挂载的民调 id；null = 不挂载 */
  pollingDataId: string | null;
  /** 两个 judge 落在的问题组；agreement 非 agree_mount 时为 null */
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
    runs: JudgeRunMeta[];
  };
  verdicts: Record<string, Partial<Record<JudgeSlot, MatchVerdict>>>;
  merged: Record<string, MergedMatch>;
}
