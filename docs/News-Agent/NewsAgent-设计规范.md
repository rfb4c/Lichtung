# 新闻采集 Agent 设计规范

> **状态**：设计确认，待实现
> **版本**：v1.0（2026-02-21）
> **实现形式**：MCP Server（Python），独立项目，非 Lichtung 主仓库
> **关联**：Lichtung 项目 / Path-B-共识可视化-设计规范.md；技术设计文档
> **具体 API 选型**：待实现时决定，本文档保留多个候选方案

---

## 0. 背景与研究动机

### 这个 Agent 是为什么而建的

本 Agent 是 **林间空地（Lichtung）** 研究项目的数据采集基础设施。

**Lichtung 是什么**

一个模拟 Twitter/X 界面的社交新闻 Feed 应用，用于验证「多数错觉可视化」干预对用户感知极化的校准效果。项目定位是 PhD 研究 Demo，目标受众为学术委员会与导师。

**感知极化（Perceived Polarization）问题**

社交网络中，仅 20% 的节点活跃即可导致 60–70% 的节点产生「该观点为多数」的错误感知（Lerman et al., 2016, *PLOS ONE*）。算法推荐系统进一步放大这一效应——高参与度的极端内容被过度呈现，用户误以为「我看到的 = 真实分布」。

**Path B 干预机制**

Lichtung 的核心干预（Path B）是：在用户进入评论区之前，强制展示该议题的**真实公众意见分布**（来自 Pew Research Center 等权威民调机构的多梯度量表数据），打破极端评论制造的「多数错觉」。

**为什么需要这个 Agent**

Path B 干预依赖两类数据：

1. **新闻报道**：Feed 流展示的具体报道，需标注所属议题（`topic_id`）以触发匹配
2. **民调分布数据**：Pew/ANES 的真实态度分布，手动录入 Supabase

本 Agent 负责第 1 类数据的自动采集——给定议题，自动搜索英文新闻报道、分析每篇报道的立场倾向（在 -1.0 到 +1.0 的连续量表上定位），并写入 Supabase，供前端 Feed 流读取展示。

### 数据约束说明

- **立场数据来源**：仅用 LLM 对单篇报道做立场分类，不声称反映真实舆论分布
- **真实分布数据**：由 Pew/ANES 民调提供，独立存储，与报道数据分离
- **Demo 范围**：仅采集英文美国媒体报道，覆盖 2–3 个美国内部争议议题

### 议题范围（Demo）

| 议题 ID | 议题 | 数据来源（民调） |
|---|---|---|
| `us-gun-control` | 枪支管控 | Pew Research 2023/2024 |
| `us-abortion` | 堕胎权利 | Pew Research 2023/2024 |
| `us-climate` | 气候政策 | Pew Research 2023/2024 |

---

## 1. 目标

自动采集指定议题的新闻报道，使用 LLM 完成立场分析和议题打标，输出结构化数据写入 Supabase。

**输入**：议题关键词 + 目标数量
**输出**：结构化报道数据（符合 `reports` 表 schema），直接写入 Supabase

---

## 2. 架构概览

```
用户（Claude Code）
    │
    │ 调用 MCP 工具
    ▼
MCP Server（Python）
    ├── search_news(topic, keywords, count)
    │       └── → NewsAPI / Google News RSS
    ├── fetch_article(url)
    │       └── → newspaper3k 提取正文
    ├── analyze_article(content, topic_id)
    │       └── → Gemini Flash API（免费层）
    │             结构化输出：立场分值 + 摘要 + 置信度
    └── upsert_to_supabase(report_data)
            └── → supabase-py
```

---

## 3. 工具规格

### 3.1 `search_news`

```
输入：
  topic_id    str   议题 ID（对应 topics 表）
  keywords    list  搜索关键词组合
  count       int   目标文章数（建议 10–15）
  date_range  str   时间范围（默认近 90 天）

输出：
  list of { url, title, source_name, published_at }
```

数据源优先级：NewsAPI（有免费层，每月 100 请求）> Google News RSS（免费无限）

### 3.2 `fetch_article`

```
输入：
  url   str   文章 URL

输出：
  { url, title, full_text, source_name, published_at, image_url }
```

使用 `newspaper3k` 库提取正文。动态渲染页面备用 `playwright`（按需引入）。

### 3.3 `analyze_article`

```
输入：
  content    str   文章正文
  topic_id   str   议题 ID（提供上下文）

输出（严格 JSON）：
  {
    stance_score:  float,   // -1.0 到 +1.0 的连续值
    stance_label:  str,     // "strongly_oppose" | "oppose" | "lean_oppose"
                            // | "neutral" | "lean_support" | "support"
                            // | "strongly_support"
    summary:       str,     // 2–3 句中文摘要
    confidence:    float    // 0.0–1.0，模型对分类的置信度
  }
```

**LLM 选择**：Gemini 2.0 Flash（Google AI Studio 免费层）
**输出约束**：系统提示强制 JSON 格式，temperature=0.1 保证稳定性

#### 系统提示模板

```
你是一个新闻立场分析专家。请分析以下关于「{topic_name}」的新闻报道，
判断其对该议题的立场倾向。

立场定义：
- +1.0 强烈支持（如：强烈支持枪支管控立法）
- 0.0  中立（如：客观陈述各方立场）
- -1.0 强烈反对（如：强烈反对枪支管控立法）

请严格按以下 JSON 格式输出，不要有任何额外文字：
{"stance_score": ..., "stance_label": "...", "summary": "...", "confidence": ...}
```

### 3.4 `upsert_to_supabase`

```
输入：完整的 report_data 对象
输出：插入成功的 record id
```

使用 `supabase-py` 库，upsert 策略（URL 作为唯一键，避免重复插入）。

---

## 4. 技术栈

| 组件 | 库/服务 | 说明 |
|---|---|---|
| MCP 框架 | `mcp`（Anthropic 官方 Python SDK） | 工具暴露协议 |
| 新闻搜索 | `NewsAPI` / Google News RSS | 免费层足够 |
| 正文提取 | `newspaper3k` | 主力；备用 `playwright` |
| LLM 分析 | Gemini Flash API（Google AI Studio） | 免费层，每天 1500 次请求 |
| 数据库写入 | `supabase-py` | 官方 Python 客户端 |
| 环境变量 | `python-dotenv` | 管理 API Keys |

---

## 5. 数据流（端到端）

```
① 调用 search_news("us-gun-control", ["gun control", "firearms law"], 12)
      └── 返回 12 条 { url, title, source, date }

② 对每个 URL 调用 fetch_article(url)
      └── 返回 { full_text, image_url, ... }

③ 对每篇文章调用 analyze_article(full_text, "us-gun-control")
      └── 返回 { stance_score: -0.7, stance_label: "oppose", summary: "...", confidence: 0.88 }

④ 组合数据，调用 upsert_to_supabase(report_data)
      └── 写入 Supabase reports 表，关联 topic_id

⑤ 人工审核（可选）：在 Supabase Dashboard 查看结果，修正明显错误的分类
```

---

## 6. 目录结构（计划）

```
agent/
├── server.py          # MCP Server 入口，注册所有工具
├── tools/
│   ├── search.py      # search_news 工具
│   ├── fetch.py       # fetch_article 工具
│   ├── analyze.py     # analyze_article 工具（Gemini API 调用）
│   └── database.py    # upsert_to_supabase 工具
├── prompts/
│   └── stance.py      # 立场分析系统提示模板
├── .env.example       # API Keys 模板（不提交真实 key）
└── requirements.txt
```

---

## 7. 实现阶段（分步）

| 阶段 | 内容 | 前置条件 |
|---|---|---|
| 阶段 1 | 数据模型落地（topics + polling_data + reports 修改） | — |
| 阶段 2 | 搭建 MCP Server 骨架 + `analyze_article` 工具（最核心） | Gemini API Key |
| 阶段 3 | 接入 `fetch_article` + `search_news` | — |
| 阶段 4 | 接入 `upsert_to_supabase` | 阶段 1 完成 |
| 阶段 5 | 端到端测试：一个议题采集 10 篇文章入库 | 阶段 1–4 |

---

## 8. 已知限制

- NewsAPI 免费层每月 100 次请求，Demo 够用，大规模需付费
- 部分媒体网站有反爬，遇到时手动提供 URL 代替自动搜索
- LLM 分类有误差，confidence < 0.7 的条目建议人工复核
- 不收集中文报道（Demo 范围内仅限英文美国媒体）
