/**
 * 假 judge。不联网、不花钱、完全确定性。
 *
 * 存在的理由：让整条管线在没有任何 API 密钥的情况下端到端跑通，从而
 *   ・零配置克隆的人能验证管线代码本身是好的
 *   ・裁决逻辑、落盘格式、diff 呈现都能在不烧钱的前提下调试
 *   ・「分歧即不挂」这条规则有一个必然会被走到的分支可对照
 *
 * 注意：产出的判定内容毫无意义，只是 reportId 的哈希。看 mock 跑出来的挂载
 * 不能说明任何关于报道内容的事情，更不能当成实跑结果提交。
 */

import { createHash } from 'node:crypto';

import type { Judge, JudgeSlot, MatchInput, MatchVerdict } from '../types';

/** 取 seed 的 sha256 第一个字节，作为 0–255 的确定性伪随机数。 */
function roll(seed: string): number {
  return createHash('sha256').update(seed, 'utf8').digest()[0];
}

export function createMockJudge(slot: JudgeSlot): Judge {
  return {
    slot,
    provider: 'mock',
    model: `mock-${slot.toLowerCase()}`,

    async match(input: MatchInput): Promise<MatchVerdict> {
      const { candidates } = input;

      // 约 40% 判 null，其余在候选里按哈希挑一条；B 再以约 20% 的概率改判。
      // 这样 agree_mount / agree_null / disagree 三条分支都会被实际走到。
      const pickNull = roll(`${input.id}:null`) < 102 || candidates.length === 0;
      const shift = slot === 'B' && roll(`${input.id}:shift`) < 51 ? 1 : 0;

      if (pickNull) {
        return {
          reportId: input.id,
          coreClaim: input.title.slice(0, 120),
          alignedPollId: null,
          evidence: { reportSpan: '', pollConcept: '', alignment: '' },
          rejection: 'mock judge: deterministic null branch, carries no meaning',
        };
      }

      const index = (roll(`${input.id}:pick`) + shift) % candidates.length;
      const poll = candidates[index];
      return {
        reportId: input.id,
        coreClaim: input.title.slice(0, 120),
        alignedPollId: poll.id,
        evidence: {
          reportSpan: input.title.slice(0, 60),
          pollConcept: poll.questionWording.slice(0, 60),
          alignment: 'mock judge: deterministic match branch, carries no meaning',
        },
        rejection: '',
      };
    },
  };
}
