# Claude Code 项目上下文

> 这个文件为 Claude Code 提供项目背景、技术架构、开发规范等**静态上下文**。
>
> **查看开发进度**: 请访问 [`ROADMAP.md`](ROADMAP.md)

---

## 📋 项目概览

**项目名称**: Lichtung (林间空地)
**项目类型**: 研究原型 - 感知极化干预系统
**技术栈**: React + TypeScript + Vite + Supabase
**当前版本**: v0.4.6 (三条路径均已实装；Path A 标注管线已实跑产出 csScore；Path B 匹配管线代码完成待实跑)
**主分支**: `main` | 开发分支: `develop`

---

## 🎯 研究目标与背景

### 研究问题
当今社会的**感知极化**现象严重：人们高估公众意见的极端程度，低估共识的存在。这种误判主要通过**媒体传播**被放大。在了解感知极化的成因机制基础上，能否通过系统设计和实装降低感知极化？

### 项目定位
这是一个研究原型，用于展示如何通过**系统设计干预**来降低媒体环境中的感知极化。

**重要**: 这不是完整的信息平台产品，而是**概念验证原型**（proof-of-concept）。

### 干预路径
1. **Path B (温和多数可视化)**: 在评论区前置真实民调数据，打破"所有人都站在两个极端"的误判
2. **Path C (交叉身份)**: 展示评论者的非政治身份标签，软化群体边界

### 数据策略
- **当前阶段**: 使用静态 JSON 数据（`src/data/app-data.json`）
- **未来扩展**: 自动新闻采集系统（News Agent），实现数据动态更新

---

## 📂 项目结构

```
/
├── src/
│   ├── components/          # React 组件
│   │   ├── FeedItem.tsx            # 新闻报道卡片
│   │   ├── CommentSection.tsx      # 评论区（含分布图表）
│   │   ├── DistributionChart.tsx   # 民调分布图表 (Path B)
│   │   ├── ProfilePage.tsx         # 个人资料页
│   │   └── ...
│   ├── contexts/            # React Context
│   │   └── AuthContext.tsx         # 用户认证
│   ├── lib/                 # 工具函数
│   │   ├── supabase.ts             # Supabase 客户端
│   │   ├── mappers.ts              # 数据映射
│   ├── types/               # TypeScript 类型定义
│   │   └── index.ts                # 核心类型
│   ├── lib/
│   │   ├── csScore.ts              # Path A 三属性加权公式的唯一实现
│   │   └── feedSorter.ts           # Path A 连续位移 + 间隔调整
│   └── data/                # 静态数据
│       ├── app-data.json           # 人工事实源：主题、民调、报道、用户、评论
│       └── annotations.json        # 管线产出的可审计层（实跑后才存在）
├── scripts/
│   ├── annotate/            # Path A 双评审标注管线（见该目录 README）
│   ├── match-polling/       # Path B 报道→民调 双评审匹配管线（见该目录 README）
│   └── check-polling-consensus.mjs # 民调入库判据与溯源字段校验
├── docs/                    # 完整文档库
│   ├── 00-Overview/                # 产品、技术设计
│   ├── 01-Path-B-温和多数可视化/    # Path B 设计规范
│   ├── 02-Path-C-交叉身份/          # Path C 设计规范
│   ├── 03-News-Agent/              # 新闻采集 Agent
│   └── 04-Path-A-反刻板印象/        # Path A 设计规范（§ 3.5 是三属性判据正本）
├── ROADMAP.md               # 开发路线图（人类可读）
├── CLAUDE.md                # 本文件（AI 可读）
└── README.md                # 项目介绍
```

---

## 🔑 核心类型定义

> **唯一权威是 [`src/types/index.ts`](src/types/index.ts)。** 下面是节选提要，
> 与代码冲突时以代码为准。

```typescript
// 主题（议题）
interface Topic {
  id: string;
  name: string;          // 如 "Gun Control"
  description: string;
  tagKeywords: string[]; // 议题覆盖范围的描述词，供检索管线使用
  subtopics?: Subtopic[];
}

// 民调数据（4-7 档可变；溯源字段目前可选，新增条目必须带齐）
interface PollingData {
  id: string;
  topicId: string;
  subtopicId?: string;
  questionWording?: string; // 逐字照抄的英文原题，也是报道→民调检索的匹配对象
  source: string;           // 如 "Pew Research Center"
  sourceUrl?: string;       // 指向能看到这组数字的具体页面
  surveyYear: number;
  fieldDates?: string;      // 调查执行期，比 surveyYear 精确
  sampleSize?: number;
  population?: string;
  geographicScope: string;
  level?: 'topic' | 'subtopic';  // 决定参与哪一级检索
  scaleLabels: string[];    // 按方向有序（一极 → 另一极）
  distribution: number[];   // 与 scaleLabels 等长，合计 100
  dontKnowPct?: number;     // DK 档已从分布剔除并重新归一，原始比例记这里
  bridgingText: string;
  verifiedBy?: 'human';
  verifiedAt?: string;
}

// 新闻报道
interface Report {
  id: string;
  topicId?: string;
  subtopicId?: string;
  pollingDataId?: string | null; // 显式挂载；null = 不显示图表。由 scripts/match-polling 产出
  title: string;
  summary: string;
  source: string;
  url?: string;
  publishedAt?: string;          // Feed 上的相对展示标签（"2h"、"1d"），不是时间戳
  imageUrl?: string;
  // Path A 排序字段
  csScore?: number;              // 0–1，标注管线产出；排序的实际依据
  counterStereotypical?: boolean;// 旧的二值标注，csScore 缺失时的回退来源
  engagementScore?: number;      // 人工填写的模拟参数，不对应真实互动数据
}
```

---

## 🛠️ 开发工作流程

### 开始新任务时
1. 查看 `ROADMAP.md` 确认当前优先级
2. 创建功能分支：`git checkout -b feature/task-name`
3. 查阅相关设计文档（`docs/` 目录）

### 编码规范
- **组件**: 使用 TypeScript + CSS Modules
- **样式**: CSS Variables 定义在 `src/index.css`
- **数据获取**: 优先使用 Supabase，降级使用静态 JSON
- **类型定义**: 所有核心类型定义在 `src/types/index.ts`

### 完成任务后
1. 更新 `ROADMAP.md` 标记任务为完成（✅）
2. 如有设计变更，更新 `docs/00-Overview/设计更新日志.md`
3. 提交代码：
   ```bash
   git add [具体文件，不要用 git add .]
   git commit -m "feat: 简洁描述"
   git push -u origin feature/task-name
   ```
5. 创建 PR 到 `develop` 分支

### Commit Message 规范
- `feat:` - 新功能
- `fix:` - 修复 bug
- `refactor:` - 重构
- `style:` - 样式调整
- `docs:` - 文档更新
- `chore:` - 构建/配置变更

---

## 🎨 设计规范

### 配色方案
- **主色**: 森林绿 `#2D5016`
- **分布图表渐变**: 沙色 `#D4A574` → 梅灰 `#7B6B8A`
- **背景**: 浅灰 `#F8F9FA`
- **边框**: `#E8E8E8`

### Path B 特定规范
- **图表高度**: 每个 bar 24px，间距 8px
- **圆角**: 4px（仅右侧）
- **桥接文本**: 显示在图表上方，字体 14px
- **数据源**: 显示在图表下方，字体 12px，灰色

**详细规范**: `docs/01-Path-B-温和多数可视化/设计规范.md`

---

## 📚 关键文档索引

| 文档 | 用途 | 何时查阅 |
|------|------|----------|
| `ROADMAP.md` | 开发路线图 | 规划任务、查看进度 |
| `docs/00-Overview/产品设计文档.md` | 产品设计 | 理解研究动机、核心假设 |
| `docs/00-Overview/技术设计文档.md` | 技术架构 | 数据库 schema、API 设计 |
| `docs/01-Path-B-温和多数可视化/设计规范.md` | Path B 规范 | 实现温和多数可视化功能 |
| `docs/01-Path-B-温和多数可视化/实施计划.md` | Path B 详细步骤 | Phase 1-4 具体任务 |
| `docs/01-Path-B-温和多数可视化/操作手册.md` | 数据采集流程 | 添加新主题、民调数据 |

---

## ⚠️ 重要提醒

### 项目研究性质
- **这是研究原型**，重点在于展示干预设计的可行性；干预效果未经对照实验检验
- **当前使用静态数据**（app-data.json），未来可能扩展为动态采集
- **优先完成核心功能验证**，性能优化和工程化可暂缓

### 数据来源与学术规范
- **民调数据**: 必须使用真实权威来源（Pew, Gallup, AP-NORC）
- **桥接文本**: 保持中立、客观，避免价值判断
- **新闻报道**: 使用真实 URL 和标题
- **引用标注**: 所有民调数据必须标注来源和日期

### 不要做的事
- ❌ 不要使用 `git add .`（明确指定文件）
- ❌ 不要修改 `.gitignore` 中的 `.claude/` 和 `.env`
- ❌ 不要在 `app-data.json` 中硬编码 `topicId`（应该由 matcher 自动分配）
- ❌ 不要创建不必要的文档文件在根目录（放到 `docs/`）

### 做的事
- ✅ 每次完成任务更新 `ROADMAP.md` 和 `CLAUDE.md`
- ✅ 新增设计变更记录在 `docs/00-Overview/设计更新日志.md`
- ✅ 使用语义化版本号（v0.3.0, v0.4.0...）
- ✅ PR 描述要详细，包含功能清单、文件变更、测试情况

---

## 🤖 Claude Code 使用建议

当你（Claude）协助开发时：
1. **任务开始前**: 先阅读 `ROADMAP.md` 了解当前优先级
2. **实现功能时**: 查阅对应的设计规范文档
3. **完成任务后**: 主动提醒更新 `ROADMAP.md` 和本文件
4. **遇到设计问题**: 引用具体的文档章节（如 `§ 3.1`）
5. **文件整理**: 帮助保持文档结构整洁，建议移动错放的文件

---

**最后同步**: 2026-08-27
**当前任务**: `feature/annotation-pipeline` — Path B 报道→民调匹配管线代码完成，
待配密钥实跑（`scripts/match-polling/README.md`）
**下一步候选**: 实跑匹配管线让 `pollingDataId` 落地；民调库扩展等人工核实的新数据；
论文与视频（9 月内动手）
