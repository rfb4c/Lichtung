# Paper Facts · 标注管线实跑数据

> 这份文件只收录**已经跑出来、可核对**的数字，供写论文时直接引用，不做解释性铺垫。
> 每个数字标注了对应的证据文件与获取方式，方便日后复核或被审稿人追问时回查。
> 口径红线：系统状态只能表述为 **built / implemented**，本文档的"一致率""复现率"
> 是标注管线自身的技术属性，不是干预效果的验证声明，写作时不要混用。

---

## 1. 运行元数据

| 项 | 值 |
|---|---|
| 运行日期 | 2026-08-25 |
| 报道总数 | 28 |
| Judge A | `anthropic` / `claude-sonnet-5` |
| Judge B | `openai` / `gpt-5.5-2026-04-23` |
| 调用总数（首次实跑） | 56（28 篇 × 2 judge） |
| 判据文件 | `scripts/annotate/prompts/path-a-cs.md` |
| Schema 文件 | `scripts/annotate/schemas/cs-attributes.json` |

## 2. 双评审一致率（`npm run annotate:merge` 输出）

逐属性一致情况（都成立 / 都不成立 / 分歧，共 28 篇）：

| 属性 | 一致 | 都成立 | 都不成立 | 分歧 |
|---|---|---|---|---|
| typicality | 25/28 | 1 | 24 | 3 |
| heterogeneity | 25/28 | 3 | 22 | 3 |
| violation | 28/28 | 5 | 23 | 0 |

分歧按 `csScore.ts` 写死的确定性规则取 0.5，不做人工裁决（见设计与交接文档 §2.2）。

## 3. csScore 分布

```
28 篇中 7 篇 csScore > 0
均值 0.137　中位 0.000　最高 1.000

位移档位分布（feedSorter 的挪动格数，系数 0.3）：
  8 格 × 1　7 格 × 2　5 格 × 1　2 格 × 1　1 格 × 2　0 格 × 21
```

## 4. 复现率（`npm run annotate:verify -- --confirm-spend` 输出，独立重跑一次）

```
168 个属性判定（28 篇 × 2 judge × 3 属性）中 161 个两次一致 = 95.8%
```

不一致的 7 处：

| 报道 | Judge | 属性 | 首次 → 重跑 |
|---|---|---|---|
| rp_abortion_006 | B | typicality | false → true |
| rp_abortion_006 | B | heterogeneity | false → true |
| rp_gun_010 | B | heterogeneity | true → false |
| rp_abortion_010 | A | typicality | true → false |
| rp_climate_010 | A | typicality | false → true |
| rp_climate_010 | A | heterogeneity | false → true |
| rp_climate_010 | A | violation | false → true |

这是模型采样的固有波动（Sonnet 5 / Opus 5 这一代已移除 `temperature`，不可强制确定性），
不是管线 bug。论文应如实报「95.8% 重跑一致率」，不声称管线是确定性的（脚本本身在
判据/模型型号漂移时会拒绝出这个数字，所以只要报出来就是同配置下测的）。

## 5. 证据文件

| 内容 | 位置 | 是否入 git |
|---|---|---|
| 首次实跑的完整判定（含双 judge 引句、`merged` 裁决结果） | `src/data/annotations.json` | 是（随本轮提交） |
| 复现校验重跑的完整判定（用于核对 §4 的 168 项逐条来源） | `docs/private/evidence/annotate-verify-rerun-2026-08-25.json` | 否（`docs/private/` 已忽略，仅本地留存） |
| 裁决产出、写回结果 | `src/data/app-data.json` 的 `report.csScore` 字段 | 是（随本轮提交） |

`annotate:verify` 按设计只把重跑结果写到系统临时目录（避免覆盖已提交的基线），
默认不进仓库；上面这份是从临时文件手动搬进来的存档副本，用于日后可以逐条核对
§4 表格里每一行分歧的原始判定（含引句），不必重新花钱重跑。
