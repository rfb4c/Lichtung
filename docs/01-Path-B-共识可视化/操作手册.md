# 共识可视化数据管线——操作手册

> 版本：v1.0 | 更新：2026-02-23
> 状态：可行性验证通过，进入 Demo 实施阶段

---

## 0. 本手册的定位

本手册覆盖从「找到一条民调数据」到「用户在评论区看到直方图」的完整链路。
Demo 阶段只实现标注 **[Demo]** 的部分；标注 **[Future]** 的部分已给出完整设计，留待后续迭代。

---

## 1. 数据源采集

### 1.1 合格数据源的判定标准

一条民调数据必须同时满足以下四项才可入库：

| # | 标准 | 说明 | 不合格示例 |
|---|------|------|-----------|
| ① | **量表档数 ≥ 3** | 至少 3 个有序档位，优先 4–7 档 | "支持/反对"二元题 |
| ② | **连续有序** | 档位之间存在逻辑递进或程度梯度 | 无序多选题（如"以下哪些因素影响了你"） |
| ③ | **权威来源** | 出自公认的非党派研究机构或学术调查 | 党派内部民调、媒体自有民调 |
| ④ | **公开可引用** | 有公开报告或数据集，可注明出处 | 付费数据库中未公开发表的原始数据 |

### 1.2 优先数据源清单

**[Demo] 仅使用 Pew Research Center 的公开报告**

| 优先级 | 数据源 | 特征 | 适用阶段 |
|--------|--------|------|----------|
| ★★★ | **Pew Research Center** | 报告直接给出各档百分比，无需跑数据；N > 5000；多档量表丰富 | Demo |
| ★★☆ | **Gallup** | 覆盖面广，但大量题目为 2–3 档，需逐题筛选 | Future |
| ★★☆ | **ANES（美国全国选举研究）** | 学术金标准，大量 7 点量表；但需从原始数据集计算分布 | Future |
| ★★☆ | **GSS（综合社会调查）** | 自 1972 年起，时间序列最长；需从原始数据集计算分布 | Future |
| ★☆☆ | **AP-NORC** | 高质量，但量表题较少 | Future |
| ★☆☆ | **Kaiser Family Foundation** | 医疗/健康政策领域权威 | Future |

### 1.3 数据采集工作流

```
┌─────────────────────────────────────────────────────┐
│  Step 1: 选定议题                                     │
│  确认该议题是否为平台可能报道的热点话题                    │
├─────────────────────────────────────────────────────┤
│  Step 2: 搜索对应 Pew 报告                             │
│  在 pewresearch.org 按议题关键词搜索                     │
│  优先选择最近 2 年内发布的报告                           │
├─────────────────────────────────────────────────────┤
│  Step 3: 逐题筛选                                     │
│  翻阅报告中的每张图表和 Topline 问卷                     │
│  筛出满足 §1.1 四项标准的题目                           │
├─────────────────────────────────────────────────────┤
│  Step 4: 录入数据库                                    │
│  按 §2 的 Schema 录入 polling.json                     │
│  为每条数据打上议题标签（§3）                            │
├─────────────────────────────────────────────────────┤
│  Step 5: 交叉验证                                     │
│  将录入的百分比与报告原文/Topline 逐项核对                │
│  确认加总 ≤ 100%（允许因四舍五入差 1–2%）                │
└─────────────────────────────────────────────────────┘
```

---

## 2. 数据库 Schema

### 2.1 核心数据结构：`polling.json`

```jsonc
{
  "meta": {
    "version": "1.0",
    "lastUpdated": "2026-02-23",
    "defaultLocale": "en-US"
  },
  "polls": [
    {
      // ── 唯一标识 ──
      "id": "pew-2024-abortion-legality",

      // ── 议题分类（§3 详述）──
      "topic": {
        "L1": "abortion",               // 一级议题
        "L2": "legality"                 // 二级议题
      },

      // ── 数据来源 ──
      "source": {
        "institution": "Pew Research Center",
        "reportTitle": "Broad Public Support for Legal Abortion Persists 2 Years After Dobbs",
        "publicationDate": "2024-05",
        "surveyDate": "2024-04-08/2024-04-14",
        "sampleSize": 8709,
        "methodology": "ATP online panel",
        "marginOfError": 1.5,
        "url": "https://www.pewresearch.org/religion/2024/05/13/broad-public-support-for-legal-abortion-persists-2-years-after-dobbs/"
      },

      // ── 题目信息 ──
      "question": {
        "id": "ABRTLGL",                 // 原始问卷题号（如有）
        "textEn": "Do you think abortion should be…",
        "textZh": "你认为堕胎应该……"       // [Future] 中文翻译
      },

      // ── 量表数据（核心）──
      "scale": {
        "tiers": 4,
        "labels": [
          { "en": "Legal in all cases",    "zh": "在所有情况下合法" },
          { "en": "Legal in most cases",   "zh": "在多数情况下合法" },
          { "en": "Illegal in most cases", "zh": "在多数情况下非法" },
          { "en": "Illegal in all cases",  "zh": "在所有情况下非法" }
        ],
        "values": [25, 38, 28, 8],        // 百分比，与 labels 一一对应
        "noAnswer": 2,                     // "无回答"百分比（不显示）
        "displayMode": "original"          // "original"=原始百分比 | "normalized"=归一化到 100%
      },

      // ── 显示控制 ──
      "display": {
        "isDefault": true,                // 是否为该 L1 议题的默认展示数据
        "footnote": "Percentages may not sum to 100% due to rounding.",
        "chartDirection": "horizontal"    // "horizontal" | "vertical"
      }
    }
  ]
}
```

### 2.2 ID 命名规则

```
{来源简称}-{年份}-{L1议题}-{L2议题}
```

示例：
- `pew-2024-abortion-legality`
- `pew-2024-abortion-medication`
- `pew-2022-gender-pronouns`
- `pew-2023-guns-assault-ban`

**[Future]** 当引入 ANES/GSS 数据后：
- `anes-2024-abortion-7point`
- `gss-2024-guncontrol-permits`

### 2.3 字段说明

| 字段 | 必填 | Demo | 说明 |
|------|------|------|------|
| `id` | ✅ | ✅ | 全局唯一标识 |
| `topic.L1` | ✅ | ✅ | 一级议题标签 |
| `topic.L2` | ✅ | ✅ | 二级议题标签 |
| `source.institution` | ✅ | ✅ | 来源机构 |
| `source.reportTitle` | ✅ | ✅ | 报告标题 |
| `source.publicationDate` | ✅ | ✅ | 发布日期 |
| `source.surveyDate` | ✅ | ✅ | 调查执行日期 |
| `source.sampleSize` | ✅ | ✅ | 样本量 |
| `source.methodology` | 建议 | ❌ | 调查方法 |
| `source.marginOfError` | 建议 | ❌ | 误差范围 |
| `source.url` | ✅ | ✅ | 报告链接 |
| `question.id` | 建议 | ❌ | 原始题号 |
| `question.textEn` | ✅ | ✅ | 英文原文题目 |
| `question.textZh` | Future | ❌ | 中文翻译 |
| `scale.tiers` | ✅ | ✅ | 档数 |
| `scale.labels` | ✅ | ✅ | 各档标签 |
| `scale.values` | ✅ | ✅ | 各档百分比 |
| `scale.noAnswer` | ✅ | ✅ | 无回答百分比 |
| `scale.displayMode` | ✅ | ✅ | 显示模式 |
| `display.isDefault` | ✅ | ✅ | 是否为 L1 默认 |
| `display.footnote` | 建议 | ✅ | 脚注 |

---

## 3. 议题分类体系（Taxonomy）

### 3.1 分类原则

- **L1（一级议题）**：对应一个宏观社会议题领域，如"堕胎权利""枪支管控"
- **L2（二级议题）**：对应该领域下的一个具体政策问题或态度维度
- 每条新闻报道打上 L1 标签 **[Demo]**，或同时打上 L1 + L2 标签 **[Future]**
- 同一报道可以打多个 L1 标签（如一篇同时涉及堕胎和宗教自由的报道）

### 3.2 Demo 议题库

**[Demo] 计划覆盖 3–4 个一级议题，每个下设 1–3 个二级议题：**

```
L1: abortion（堕胎权利）
├── L2: legality          整体合法性（4档）     ← isDefault
├── L2: medication        药物堕胎（3档）
└── L2: access            获取难度（3档）

L1: guns（枪支管控）
├── L2: overall           整体管控力度（4档）    ← isDefault [待验证]
├── L2: background-check  背景调查（待验证）
└── L2: assault-ban       攻击性武器禁令（待验证）

L1: gender-identity（性别认同）
├── L2: pronouns          使用新代词的重要性（4档）← isDefault
├── L2: new-name          使用新名字的重要性（4档）
├── L2: acceptance         社会接受程度（3档）
└── L2: pace-of-change     变化速度（3档）

L1: immigration（移民）[如时间允许]
├── L2: levels             移民规模偏好（3档）    ← isDefault
└── L2: policy             具体政策态度（待验证）
```

### 3.3 标签命名规范

| 规则 | 示例 |
|------|------|
| 全小写英文 | `abortion`, `guns` |
| 用连字符连接多词 | `gender-identity`, `background-check` |
| L1 尽量用 1 个词 | `abortion` 而非 `abortion-rights` |
| L2 描述具体维度 | `legality`, `medication`, `pronouns` |

### 3.4 [Future] 完整分类体系扩展方向

```
L1: climate（气候变化）
L1: healthcare（医疗保障）
L1: economy（经济政策）
L1: education（教育政策）
L1: policing（执法与治安）
L1: technology（科技监管）
L1: religion（宗教与公共生活）
```

---

## 4. 报道 → 数据匹配

### 4.1 匹配机制

```
[新闻报道] ──标签──→ [议题标签] ──查询──→ [polling.json] ──渲染──→ [直方图]
```

**[Demo] 粗粒度匹配：报道 → L1 → 该 L1 下 isDefault=true 的数据条目**

```
报道《Texas passes new abortion restrictions》
  → 人工标签：L1 = "abortion"
  → 查询 polling.json：topic.L1 === "abortion" && display.isDefault === true
  → 命中：pew-2024-abortion-legality
  → 渲染直方图：[25%, 38%, 28%, 8%]
```

**[Future] 细粒度匹配：报道 → L1 + L2 → 精确命中**

```
报道《FDA reviews medication abortion access》
  → NLP 自动标签 或 人工标签：L1 = "abortion", L2 = "medication"
  → 查询 polling.json：topic.L1 === "abortion" && topic.L2 === "medication"
  → 命中：pew-2024-abortion-medication
  → 渲染直方图：[20%, 54%, 25%]
```

### 4.2 匹配逻辑伪代码

```typescript
function findPollingData(
  reportTags: { L1: string; L2?: string }
): PollEntry | null {

  const { L1, L2 } = reportTags;

  // [Future] 优先精确匹配 L1 + L2
  if (L2) {
    const exact = polls.find(
      p => p.topic.L1 === L1 && p.topic.L2 === L2
    );
    if (exact) return exact;
  }

  // [Demo] 回退到 L1 默认
  const fallback = polls.find(
    p => p.topic.L1 === L1 && p.display.isDefault === true
  );
  return fallback ?? null;
}
```

### 4.3 [Demo] 报道标签方式

Demo 阶段使用**人工硬编码**：在 `reports.json` 的每条报道中直接写入 `topicL1` 字段。

```jsonc
// reports.json 中的一条报道
{
  "id": "report-001",
  "title": "Texas passes new abortion restrictions after Dobbs ruling",
  "topicL1": "abortion",        // 人工标注
  // "topicL2": "legality",     // [Future] 精确标注
  // ...
}
```

### 4.4 [Future] 自动标签方案

| 方案 | 描述 | 复杂度 |
|------|------|--------|
| 关键词匹配 | 维护每个 L1/L2 的关键词表，正则匹配报道标题和正文 | 低 |
| LLM 分类 | 将报道摘要发给 LLM，要求输出 L1 + L2 标签 | 中 |
| Embedding 相似度 | 将议题描述和报道文本向量化，计算余弦相似度 | 高 |

---

## 5. 数据展示规范

### 5.1 直方图渲染参数

```typescript
interface ChartConfig {
  // 数据
  tiers: number;                    // 档数（3–7）
  labels: string[];                 // 各档标签
  values: number[];                 // 各档百分比
  
  // 视觉
  direction: "horizontal";          // 柱状方向
  barColors: string[];              // 由 getBarColors(tiers) 生成
  showValues: true;                 // 是否在柱子上显示百分比数字
  
  // 来源信息
  sourceText: string;               // 如 "Pew Research Center, May 2024"
  footnote?: string;                // 可选脚注
}
```

### 5.2 配色方案（暖色系非政治中性色）

```typescript
// 从沙棕到灰紫的暖色过渡
function getBarColors(count: number): string[] {
  const warmEnd  = [212, 165, 116]; // #D4A574 Sand
  const coolEnd  = [123, 107, 138]; // #7B6B8A Plum Grey
  return Array.from({ length: count }, (_, i) => {
    const ratio = count === 1 ? 0.5 : i / (count - 1);
    const r = Math.round(warmEnd[0] + (coolEnd[0] - warmEnd[0]) * ratio);
    const g = Math.round(warmEnd[1] + (coolEnd[1] - warmEnd[1]) * ratio);
    const b = Math.round(warmEnd[2] + (coolEnd[2] - warmEnd[2]) * ratio);
    return `rgb(${r}, ${g}, ${b})`;
  });
}
```

### 5.3 无回答处理

**决策：显示原始百分比，不归一化。**

- `scale.values` 存原始调查数据（如 [25, 38, 28, 8]，总和 99%）
- `scale.noAnswer` 单独记录无回答比例（如 2%），不参与渲染
- 脚注统一注明："Percentages may not sum to 100% due to rounding."
- 理由：保持与原始报告数字一致，便于用户核查

### 5.4 来源标注格式

直方图下方固定显示来源行：

```
Source: {institution}, {publicationDate} | N = {sampleSize}
```

示例：
```
Source: Pew Research Center, May 2024 | N = 8,709
```

**[Future]** 来源行可点击，跳转至 `source.url`。

---

## 6. Demo 实施清单

### 6.1 数据采集任务

| # | 任务 | 数据源 | 状态 |
|---|------|--------|------|
| 1 | 堕胎 - 整体合法性（4档） | Pew 2024 abortion report, p.8 | ✅ 已验证 |
| 2 | 堕胎 - 药物堕胎（3档） | 同上报告 | ⚠️ 待录入 |
| 3 | 堕胎 - 获取难度（3档） | 同上报告 | ⚠️ 待录入 |
| 4 | 性别认同 - 新代词（4档） | Pew 2022 gender identity report, p.16 | ✅ 已验证 |
| 5 | 性别认同 - 新名字（4档） | 同上报告, p.16 | ✅ 已验证 |
| 6 | 性别认同 - 社会接受度（3档） | 同上报告, p.5 | ✅ 已验证 |
| 7 | 性别认同 - 变化速度（3档） | 同上报告, p.18 | ✅ 已验证 |
| 8 | 枪支管控 - 整体管控力度 | Pew 2023 gun report | ⏳ 待验证 |
| 9 | 枪支管控 - 具体政策 | 同上 | ⏳ 待验证 |

### 6.2 工程实施步骤

```
Phase 1: 数据层（本手册范围）
  ☐ 建立 polling.json，录入已验证数据
  ☐ 验证枪支管控报告数据
  ☐ 在 reports.json 中为每条报道添加 topicL1 字段

Phase 2: 匹配层
  ☐ 实现 findPollingData() 函数
  ☐ 将匹配结果传入 DistributionChart 组件

Phase 3: 渲染层
  ☐ DistributionChart 组件读取 polling.json 数据
  ☐ 动态生成柱子数量、标签、颜色
  ☐ 显示来源标注和脚注

Phase 4: 集成
  ☐ 评论区默认曝光直方图
  ☐ 独立数据按钮触发展示
```

### 6.3 验收标准

Demo 完成时应能演示以下场景：

1. 用户浏览一条关于堕胎的报道 → 评论区自动显示 4 档直方图（25/38/28/8）
2. 用户浏览一条关于跨性别代词的报道 → 评论区显示 4 档直方图（34/21/26/18）
3. 用户浏览一条无匹配议题的报道 → 不显示直方图
4. 直方图下方显示来源（Pew Research Center）和样本量
5. 柱子颜色为沙棕→灰紫暖色梯度，无政治色彩暗示

---

## 7. [Future] 后续迭代路线图

### 7.1 数据层扩展

| 阶段 | 目标 | 关键动作 |
|------|------|----------|
| v1.1 | 覆盖 6+ 个一级议题 | 增加 immigration, climate, healthcare, economy |
| v1.2 | 引入 ANES 7 点量表 | 下载 ANES 2024 数据集，计算各档分布 |
| v1.3 | 引入 GSS 时间序列 | 展示同一议题的态度变化趋势 |
| v2.0 | 中文议题支持 | 接入 CGSS（中国综合社会调查）或相关中文数据源 |

### 7.2 匹配层升级

| 阶段 | 当前 | 目标 |
|------|------|------|
| Demo | 人工 L1 标签，isDefault 回退 | — |
| v1.1 | 关键词表自动 L1 标签 | 报道标题自动匹配一级议题 |
| v1.2 | LLM 辅助 L1 + L2 标签 | 报道内容自动匹配二级议题 |
| v2.0 | Embedding 语义匹配 | 无需预定义标签，自动找到最相关的民调数据 |

### 7.3 展示层增强

| 功能 | 描述 |
|------|------|
| 趋势叠加 | 同一议题多年数据叠加对比（如 2017 vs 2022 vs 2024） |
| 人口细分 | 展示按年龄/性别/党派的分布差异（数据已存在于 Pew 报告中） |
| 用户自测 | "你的立场在哪里？" 互动功能 |
| 数据新鲜度提醒 | 当数据超过 2 年未更新时显示提示 |

---

## 附录 A：已验证数据一览

### A.1 堕胎 - 整体合法性

- **来源**：Pew Research Center, "Broad Public Support for Legal Abortion Persists 2 Years After Dobbs", May 2024
- **题目**：ABRTLGL — Do you think abortion should be…
- **样本**：N = 8,709 | MOE ±1.5%
- **数据**：

| 档位 | 标签 | 百分比 |
|------|------|--------|
| 1 | Legal in all cases | 25% |
| 2 | Legal in most cases | 38% |
| 3 | Illegal in most cases | 28% |
| 4 | Illegal in all cases | 8% |
| — | No answer | 2% |

### A.2 性别认同 - 使用新代词

- **来源**：Pew Research Center, "Americans' Complex Views on Gender Identity and Transgender Issues", June 2022
- **题目**：If a person transitions… how important is it that others refer to them by their new pronouns?
- **样本**：N = 10,188 | MOE ±1.6%
- **数据**：

| 档位 | 标签 | 百分比 |
|------|------|--------|
| 1 | Extremely/Very important | 34% |
| 2 | Somewhat important | 21% |
| 3 | A little/Not at all important | 26% |
| 4 | Should not be done | 18% |
| — | No answer | ~1% |

### A.3 性别认同 - 使用新名字

- **来源**：同 A.2
- **数据**：

| 档位 | 标签 | 百分比 |
|------|------|--------|
| 1 | Extremely/Very important | 47% |
| 2 | Somewhat important | 22% |
| 3 | A little/Not at all important | 18% |
| 4 | Should not be done | 12% |
| — | No answer | ~1% |

### A.4 性别认同 - 社会接受程度

- **来源**：同 A.2
- **数据**：

| 档位 | 标签 | 百分比 |
|------|------|--------|
| 1 | Gone too far | 38% |
| 2 | Been about right | 23% |
| 3 | Not gone far enough | 36% |
| — | No answer | ~3% |

### A.5 性别认同 - 变化速度

- **来源**：同 A.2
- **数据**：

| 档位 | 标签 | 百分比 |
|------|------|--------|
| 1 | Too quickly | 43% |
| 2 | About the right speed | 28% |
| 3 | Not quickly enough | 26% |
| — | No answer | ~3% |

---

## 附录 B：质量检查清单

每条数据录入后，执行以下检查：

- [ ] 百分比加总 ≤ 100%（允许差值 ≤ 2%，因四舍五入）
- [ ] 百分比加总 + noAnswer ≈ 100%（允许差值 ≤ 1%）
- [ ] labels 数组长度 === values 数组长度 === tiers
- [ ] 档位标签顺序与原始报告一致
- [ ] source.url 可访问且指向正确报告
- [ ] id 在 polling.json 中唯一
- [ ] isDefault 在同一 L1 下只有一个为 true
- [ ] 该数据条目的 L1 标签存在于议题分类体系（§3.2）中