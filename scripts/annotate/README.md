# 标注管线 · Path A 反刻板范例三属性

两个来自不同厂商的模型各自独立读同一份判据，对每篇报道给出三属性判定；
分歧按事前写定的规则取半分，加权得到 `csScore`，写回 `src/data/app-data.json`。

**前端不依赖这条管线。** `csScore` 缺失时回退到 `counterStereotypical` 布尔值，
零配置克隆（不建 `.env`）照常运行。管线是离线的标注工具，不在浏览器里跑。

---

## 数据流

```
src/data/app-data.json        人工事实源（标题、来源、URL）
src/data/source-texts.json    出版方原文槽位（og:description / 首段 / 正文）
　↓ 判定输入 = 标题 + 全部非空槽位，刻意不传既有标注，避免污染判定
prompts/path-a-cs.md ＋ schemas/cs-attributes.json
　↓ 两个 judge 读同一份 rubric 与同一份 schema，互不可见
src/data/annotations.json     可审计层：两份原始判定 + 引句 + 模型 ID + 哈希
　↓ 03-merge：逐属性比对 → 0 / 0.5 / 1 → computeCsScore()
src/data/app-data.json        只写回 report.csScore 一个字段
```

`annotations.json` 保留两个 judge 的**完整原始判定**而不只是裁决结果。裁决规则是
事前写定的，任何人拿到这个文件都能自己重算一遍，不必信任本管线的实现。

---

## 三属性与裁决规则

```
csScore = 0.40·典型性 + 0.35·异质性 + 0.25·中等违背
```

判据全文见 [`prompts/path-a-cs.md`](prompts/path-a-cs.md)；加权公式的唯一实现在
[`src/lib/csScore.ts`](../../src/lib/csScore.ts)，管线与运行时排序共用同一份，
避免公式在两处漂移。

每个属性由两个 judge 独立判断，取值只有三档：

```
都判成立   → 1.0
判断不一致 → 0.5   ← 分歧本身说明该属性存疑，只给一半把握
都判不成立 → 0
```

### 弃权

每个属性还有第三种结果 `insufficient_evidence`：**可得文本不足以判定**。它与
「判定为不成立」是两个不同的主张，分开记录——语料里有报道在存档上只剩标题，
把两者记成同一件事，等于让缺数据冒充判定结果。

弃权在**打分**上与「判不成立」同权（都记 0，报道留在基线位置，不干预）；
在**统计**上分开：

```
两个 judge 都弃权 → 剔除出 κ 的分母，单独报弃权率
一方弃权一方判定 → 算作不一致，进 κ 的分母
```

一方弃权算不一致，是因为「证据够不够」本身就是两个模型可以真实分歧的事情，
剔除它等于把最难的条目从考卷上划掉。两个都弃权则没有「判定是否一致」可谈，
算成一致会让缺文本冒充共识。

### 输入层级

判定输入是**槽位模型**：抓到什么给什么，空的留空。每篇实际用到的最深槽位
（`body` / `lede` / `og` / `headline`）记进 `annotations.json` 的 `tiers`，
供分层报告一致率与弃权率。

这是**事后记录的结果，不是事前设定的门槛**——回退顺序
`og:description → 首段 → 仅标题` 是 Open Graph 协议加聚合器解析链接预览的既有
顺序，判定规则里没有一个数字来自本语料的覆盖率。

**不设人工裁决。** 让人来裁会引入研究者自由度（「你按什么标准裁的？会不会偏向
让 demo 好看的一边？」），而模型分歧恰恰是「这条报道在该属性上本来就模糊」的证据。

每个属性判断都要求附报道原文引句。用途是可审计、便于双评审比对、防模型无据判断。

---

## 运行

### 不花钱，验证管线本身

```bash
npm run annotate:mock      # 假 judge，完全确定性，不联网
npm run annotate:merge     # 裁决并写回 csScore
npm run annotate:verify    # 重跑 diff（mock 下必然 100%）
```

mock 的判定内容只是 report id 的哈希，**不能用来说明任何关于报道内容的事情**，
只用来验证管线代码、裁决逻辑、落盘格式和 diff 机制是好的。

### 实跑

需要两把密钥，写进仓库根目录的 `.env`（已在 `.gitignore`）：

```
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...
OPENAI_JUDGE_MODEL=...
```

`OPENAI_JUDGE_MODEL` **不要凭记忆填**——跑 `npm run annotate:models` 从 API 拉当前
账号可用的型号列表来确认。这个值会写进 `annotations.json` 的 meta 并被论文引用。

密钥变量名**不带 `VITE_` 前缀**：Vite 会把 `VITE_*` 内联进 `dist/`。

```bash
npm run annotate:models                    # 确认 Judge B 的型号
npm run annotate                           # 两个 judge 各跑一遍
npm run annotate -- --resume               # 中途失败后只补缺失条目
npm run annotate -- --limit 3              # 冒烟，只跑前 3 篇
npm run annotate:merge
npm run annotate:verify -- --confirm-spend # 重跑一遍做 diff，会再花一轮钱
```

### 花钱的路径上设了四道闸

这条管线会花钱，所以「出错时的默认行为」比正常路径更值得设计：

・**`--judges` 拼错直接拒绝**，不回落到实跑。拼错一个字母就开始花钱，这个代价不该由拼写承担
・**每个 judge 的第一次调用先单独跑**，失败即中止。密钥错、模型 ID 错、schema 被某一家拒绝，
　这类问题必然在首次调用暴露；不先探一下就放并发，等来的是 56 条一模一样的报错。
　这一步同时把 rubric 写进各自的 prompt 缓存，后面的并发才读得到
・**`--resume` 会核对配置**：判据、schema、两个 judge 的型号但凡与已有判定对不上就拒绝续跑。
　否则文件里会一半来自配置 X、一半来自配置 Y，而 meta 只记得住后一个——作为审计层就废了，
　且从文件本身看不出来
・**有调用失败时退出码为 1**，`annotate && merge` 这类链式命令不会用半份判定接着裁决

### 类型检查

```bash
npm run typecheck:scripts
```

主 `tsconfig.json` 的 `include` 只有 `src`，所以 `npm run build` 不会碰这些脚本；
它们由 `tsconfig.scripts.json` 单独检查。

---

## 关于可复现性的口径

Sonnet 5 / Opus 5 这一代**已移除 `temperature`**（传了直接 400），也没有 seed。
因此同一输入重跑**不保证**同一输出。这条管线能声称的是：

- 固定模型 ID（不加日期后缀），原样记录进 `annotations.json`
- rubric 与 JSON Schema 随代码入库，内容哈希一并记录——判定结果与 prompt 版本
  对不上时 `99-verify` 会直接报警
- 全部原始判定落盘
- 重跑差异已量化并留档（`npm run annotate:verify`）

**不能声称 deterministic。** 论文里报重跑一致率，比含糊地说「可复现」诚实。

---

## 文件

| 文件 | 作用 |
|---|---|
| `prompts/path-a-cs.md` | 判据全文，论文附录直接引用 |
| `schemas/cs-attributes.json` | 输出的 JSON Schema，两家厂商共用同一份 |
| `00-list-openai-models.ts` | 拉 OpenAI 可用型号，确认 Judge B 的模型 ID |
| `01-annotate-path-a.ts` | 调用两个 judge，写原始判定 |
| `03-merge.ts` | 裁决 → `csScore` → 写回 `app-data.json` |
| `99-verify.ts` | 重跑并逐属性 diff，量化采样波动 |
| `lib/types.ts` | 三层共享类型 |
| `lib/io.ts` | 唯一的读写入口；`app-data.json` 只允许改 `csScore` |
| `lib/judges/anthropic.ts` | Judge A |
| `lib/judges/openai.ts` | Judge B |
| `lib/judges/mock.ts` | 假 judge，无密钥端到端验证用 |
