# Lichtung（林间空地）

> 感知极化校准研究 Demo - 通过温和多数可视化和交叉身份标签，修正用户对公众态度的感知偏差

[![Version](https://img.shields.io/badge/version-0.4.5-green.svg)](https://github.com/rfb4c/Lichtung)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)

---

## 🎯 项目简介

### 研究背景

当今社会的**感知极化**（perceived polarization）现象日益严重：人们往往高估公众意见的极端程度，低估共识的存在。这种误判主要通过**媒体传播**被放大——极端观点在社交媒体上获得更高的曝光度，而温和的大多数往往保持沉默。

### 项目定位

**Lichtung（林间空地）** 是一个研究原型，用于探索如何通过**系统设计干预**降低媒体环境中的感知极化程度。

本项目不是完整的新闻产品，而是**概念验证**（proof-of-concept）性质的研究工具，用于把感知极化的认知机制转译为可运行的界面与排序设计。三条干预路径均已实装，但**尚未经过任何对照实验检验**。

### 干预路径

- **Path A (反刻板范例注入)**: 在 Feed 排序中提升反刻板印象内容的可见性，改变用户接触到的样本结构

- **Path B (温和多数可视化)**: 在评论区前置真实民调数据的分布图表，呈现"温和的大多数"，打破"所有人都站在两个极端"的误判

- **Path C (交叉身份)**: 展示评论者的非政治身份标签（如职业、兴趣），软化政治对立群体之间的边界

### 当前阶段

- ✅ **三条干预路径均已实装**，但呈现方式各不相同：
  - **Path A** 提供 Algorithm / Calibrated 两种排序模式，可在界面上直接切换对比
  - **Path B** 的民调分布图表按需展开（报道卡片上的 "Public Opinion" 按钮）
  - **Path C** 的身份标签常驻显示在评论下方，没有独立开关
- 📄 **数据**：静态 JSON 为事实源（`src/data/app-data.json`），Supabase 为可选后端，二者内容一致
- 🔮 **未来计划**: 扩展为自动新闻采集系统（News Agent）；把原型扩展为可做随机对照实验的平台

> 干预效果尚未经任何对照实验检验。本仓库交付的是设计与实现，不是效果证据。

---

## 📚 核心文档

| 文档 | 描述 |
|------|------|
| [📅 ROADMAP.md](ROADMAP.md) | **开发路线图** - 版本规划、里程碑、当前任务 |
| [🤖 CLAUDE.md](CLAUDE.md) | **AI 助手上下文** - 项目结构、开发规范、当前状态 |
| [📖 docs/](docs/) | **完整文档库** - 产品设计、技术架构、功能规范 |

---

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 本地开发
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

---

## 🏗️ 技术栈

- **前端**: React 18 + TypeScript + Vite
- **样式**: CSS Modules
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **部署**: Vercel / Netlify

---

## 📂 项目结构

```
/
├── src/
│   ├── components/          # React 组件
│   ├── contexts/            # React Context (认证等)
│   ├── lib/                 # 工具函数（Supabase、匹配算法）
│   ├── types/               # TypeScript 类型定义
│   └── data/                # 静态数据（主题、民调、报道）
├── docs/                    # 完整文档库
│   ├── 00-Overview/         # 产品与技术设计
│   ├── 01-Path-B-温和多数可视化/ # Path B 设计规范
│   ├── 02-Path-C-交叉身份/   # Path C 设计规范
│   └── 03-News-Agent/       # 新闻采集 Agent
├── ROADMAP.md               # 开发路线图
├── CLAUDE.md                # AI 助手项目上下文
└── README.md                # 本文件
```

---

## 🎨 核心功能

### ✅ 已实现 (v0.3.2)
- 新闻报道流（FeedItem）
- 用户认证与个人资料
- 评论系统与报道链接跳转
- 移动端/平板端响应式适配
- **Path B Phase 1 & 2**:
  - 分布图表组件 (DistributionChart)
  - 评论区集成图表
  - 双按钮交互（单看数据 / 单看评论）
  - 主题标签显示
  - 基础主题匹配算法
- **Path C Phase 1**:
  - 交叉身份标签系统基础实现

### 🚧 开发中 (v0.4.0)
- Path C 完整功能实现
- 主题匹配算法优化
- UI/UX 持续增强

### 🔮 计划中
- **v0.4.0**: Path C 交叉身份标签系统
- **v0.5.0**: News Agent 自动化新闻采集
- **v1.0.0**: 研究就绪版（含 A/B 测试、行为分析）

详见 [ROADMAP.md](ROADMAP.md)

---

## 📖 文档导航

### 新手入门
1. 阅读 [产品设计文档](docs/00-Overview/产品设计文档.md) 了解研究动机和假设
2. 阅读 [技术设计文档](docs/00-Overview/技术设计文档.md) 了解系统架构
3. 查看 [ROADMAP.md](ROADMAP.md) 了解当前开发进度

### 功能开发
- **实现 Path B**: [Path B 设计规范](docs/01-Path-B-温和多数可视化/设计规范.md) + [实施计划](docs/01-Path-B-温和多数可视化/实施计划.md)
- **实现 Path C**: [Path C 设计规范](docs/02-Path-C-交叉身份/设计规范.md)
- **搭建 News Agent**: [Agent 设计规范](docs/03-News-Agent/设计规范.md)

### AI 协作
- 查看 [CLAUDE.md](CLAUDE.md) 获取项目上下文、开发规范、当前任务

---

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支: `git checkout -b feature/new-feature`
3. 提交代码: `git commit -m 'feat: 添加新功能'`
4. 推送分支: `git push origin feature/new-feature`
5. 创建 Pull Request 到 `develop` 分支

**Commit 规范**: `feat:` / `fix:` / `refactor:` / `style:` / `docs:` / `chore:`

---

## 📄 License

本项目仅用于研究目的，暂未指定开源许可证。

---

## 📧 联系方式

项目维护者: [@rfb4c](https://github.com/rfb4c)

---

**当前版本**: v0.3.2 | **最后更新**: 2026-03-14
