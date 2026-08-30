/**
 * 假 judge。不联网、不花钱、完全确定性。
 *
 * 存在的理由：让整条管线在没有任何 API 密钥的情况下端到端跑通，从而
 *   ・零配置克隆的人能验证管线代码本身是好的
 *   ・裁决逻辑、落盘格式、复现校验都能在不烧钱的前提下调试
 *   ・99-verify 的 diff 机制有一个「重跑必然一致」的基准可对照
 *
 * 注意：产出的判定内容毫无意义，只是 reportId 的哈希。看 mock 跑出来的
 * Feed 顺序不能说明任何关于报道内容的事情。
 */

import { createHash } from 'node:crypto';

import { INSUFFICIENT } from '../types';
import type {
  BinaryJudgment,
  Judge,
  JudgeInput,
  JudgeSlot,
  JudgeVerdict,
  Prototype,
  ViolationJudgement,
  ViolationLevel,
} from '../types';

/** 取 seed 的 sha256 第一个字节，作为 0–255 的确定性伪随机数。 */
function roll(seed: string): number {
  return createHash('sha256').update(seed, 'utf8').digest()[0];
}

/** 从原文截一段当引句，保证 evidence 确实是原文的子串。 */
function excerpt(input: JudgeInput): string {
  return input.title.slice(0, 60);
}

const PROTOTYPES: Prototype[] = ['cross_party', 'intra_dissent', 'individuating', null];

export function createMockJudge(slot: JudgeSlot): Judge {
  return {
    slot,
    provider: 'mock',
    model: `mock-${slot.toLowerCase()}`,

    async annotate(input: JudgeInput): Promise<JudgeVerdict> {
      const base = input.id;

      // A 的判定由报道 id 决定；B 在 A 的基础上以约 20% 的概率翻转。
      // 这样两个 judge 的一致率落在真实管线的量级上，裁决层的 0.5 分支
      // 才会被实际走到，而不是永远走 agree 或永远走 disagree。
      const flips = (attribute: string): boolean =>
        slot === 'B' && roll(`${base}:${attribute}:flip`) < 51;

      // 弃权分支要能被真的走到，否则裁决层的三条弃权规则永远没有 mock 覆盖。
      // 只有标题的报道**两个 judge 都弃权**（真实模型面对同样的输入也该如此），
      // 其余报道让 B 偶尔单方弃权，把「一方弃权一方判定」那一支也顶出来。
      const abstains = (attribute: string): boolean =>
        input.tier === 'headline' ||
        (slot === 'B' && roll(`${base}:${attribute}:abstain`) < 26);

      const decide = (attribute: string, threshold: number): BinaryJudgment => {
        if (abstains(attribute)) return INSUFFICIENT;
        return (roll(`${base}:${attribute}`) < threshold) !== flips(attribute) ? 'yes' : 'no';
      };

      const violation = ((): ViolationJudgement => {
        if (abstains('violation')) {
          return { level: INSUFFICIENT, evidence: excerpt(input) };
        }
        const violationRoll = roll(`${base}:violation`);
        let level: ViolationLevel =
          violationRoll < 90 ? 'none' : violationRoll < 180 ? 'moderate' : 'extreme';
        if (flips('violation')) {
          level = level === 'moderate' ? 'none' : 'moderate';
        }
        return { level, evidence: excerpt(input) };
      })();

      return {
        reportId: input.id,
        typicality: { judgment: decide('typicality', 128), evidence: excerpt(input) },
        heterogeneity: { judgment: decide('heterogeneity', 110), evidence: excerpt(input) },
        violation,
        prototype: PROTOTYPES[roll(`${base}:prototype`) % PROTOTYPES.length],
      };
    },
  };
}
