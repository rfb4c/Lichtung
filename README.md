# Lichtung（林间空地）

> 感知极化校准研究 Demo - 通过共识可视化和交叉身份标签，修正用户对公众态度的感知偏差

[![Version](https://img.shields.io/badge/version-0.2.1-green.svg)](https://github.com/rfb4c/Lichtung)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)

---

## 🎯 项目简介

### 研究背景

当今社会的**感知极化**（perceived polarization）现象日益严重：人们往往高估公众意见的极端程度，低估共识的存在。这种误判主要通过**媒体传播**被放大——极端观点在社交媒体上获得更高的曝光度，而温和的大多数往往保持沉默。

### 项目定位

**Lichtung（林间空地）** 是一个**博士申请研究项目**的模拟系统，旨在探索通过**系统设计干预**来降低媒体环境中的感知极化程度。

本项目不是完整的新闻产品，而是用于**概念验证**（proof-of-concept）的研究原型，重点展示两种干预路径的设计思路与技术实现。

### 干预路径

- **Path B (共识可视化)**: 在评论区前置真实民调数据的分布图表，帮助用户认识到"沉默的大多数"，打破"多数错觉"（pluralistic ignorance）

- **Path C (交叉身份)**: 展示评论者的非政治身份标签（如职业、兴趣），软化政治对立群体之间的边界，促进人性化理解

### 当前阶段

- ✅ **Phase 1-2**: 使用静态 JSON 数据，完成核心功能实现（Path B 共识可视化）
- 🔮 **未来计划**: 扩展为自动新闻采集系统（News Agent），实现数据的动态更新与主题自动标注

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
│   ├── 01-Path-B-共识可视化/ # Path B 设计规范
│   ├── 02-Path-C-交叉身份/   # Path C 设计规范
│   └── 03-News-Agent/       # 新闻采集 Agent
├── ROADMAP.md               # 开发路线图
├── CLAUDE.md                # AI 助手项目上下文
└── README.md                # 本文件
```

---

## 🎨 核心功能

### ✅ 已实现 (v0.2.1)
- 新闻报道流（FeedItem）
- 用户认证与个人资料
- 评论系统
- **Path B Phase 1 & 2**:
  - 分布图表组件 (DistributionChart)
  - 评论区集成图表
  - 双按钮交互（单看数据 / 单看分析）
  - 主题标签显示
  - 基础主题匹配算法

### 🚧 开发中 (v0.3.0)
- 主题匹配算法优化
- 扩充主题与民调数据
- UI/UX 增强

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
- **实现 Path B**: [Path B 设计规范](docs/01-Path-B-共识可视化/设计规范.md) + [实施计划](docs/01-Path-B-共识可视化/实施计划.md)
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

**当前版本**: v0.2.1 | **最后更新**: 2026-03-07
