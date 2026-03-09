# Lichtung 开发路线图

> **项目定位**: 感知极化校准研究 Demo
> **当前版本**: v0.3.0
> **最后更新**: 2026-03-09

---

## 🎯 项目目标

### 研究背景
当今社会的**感知极化**现象日益严重，人们往往高估公众意见的极端程度。这种误判主要通过**媒体传播**被放大——极端观点获得更高曝光，而温和的大多数保持沉默。

### 项目性质
这是一个**博士申请研究项目**的模拟系统，用于展示如何通过**系统设计干预**来降低媒体环境中的感知极化程度。

### 干预路径验证
- **Path B (共识可视化)**: 通过可视化真实民调数据，修正用户对公众态度分布的感知，打破"多数错觉"
- **Path C (交叉身份)**: 通过展示交叉身份标签，软化政治对立群体间的边界，促进人性化理解

### 数据策略
- **当前**: 使用静态 JSON 数据展示核心功能
- **未来**: 扩展为自动新闻采集系统，实现数据动态更新

---

## 📅 版本规划

### ✅ v0.1.0 - 基础框架 (已完成)
**发布时间**: 2025-12-15
**里程碑**: 完成基础新闻流、用户系统、评论区

**核心功能**:
- ✅ Supabase 集成（用户认证、数据库）
- ✅ 新闻报道流（FeedItem）
- ✅ 评论系统（CommentSection）
- ✅ 个人资料页（ProfilePage）
- ✅ 深浅主题切换
- ✅ 媒体源 Logo（Apistemic API）

---

### ✅ v0.2.0 - Path B Phase 1 & 2 (已完成)
**发布时间**: 2026-03-07
**里程碑**: Path B 共识可视化核心功能上线

**Phase 1: 数据架构重构**
- ✅ 类型系统更新（Event → Topic, Distribution → PollingData）
- ✅ 删除旧设计（SpectrumBar, DistributionTooltip）
- ✅ 创建 app-data.json（topics, pollingData, reports）

**Phase 2: 组件实现**
- ✅ DistributionChart 组件（4-7 档可变直方图）
- ✅ CommentSection 集成（顶部固定图表）
- ✅ FeedItem 双按钮（单看数据 / 单看分析）
- ✅ 主题标签显示
- ✅ 基础主题匹配算法（matchers.ts）

**数据内容**:
- ✅ 3 个主题（Gun Control, Abortion, Climate Change）
- ✅ 真实民调数据（Pew Research）
- ✅ 24 篇示例报道

---

### 🚧 v0.3.0 - Path C 实现 (进行中 - 最高优先级)
**目标发布**: 2026-03-20
**里程碑**: 完成 Demo - 两条干预路径全部实装

#### 🔴 最高优先级 (CRITICAL - Demo 核心功能)

##### 👥 Path C: 交叉身份标签系统（静态原型）
🤔 **状态**: 🟢 完成 (2026-03-07)
**预估工时**: 4-7 小时（静态原型）
**优先级**: ⭐⭐⭐ 最高

**实施策略**: 与 Path B 一致，先用静态数据验证效果，满意后再做数据库实装

**Phase 1: 静态数据原型** (✅ 已完成)
- [x] **扩展 `app-data.json`**
  - [x] 为示例用户添加 `identities` 字段和 `avatarUrl`
  - [x] 设计身份标签类别与结构（Family/Experience/Role/Lifestyle 四层模型）
  - [x] 12 个用户配置精细交叉标签，73 条定制评论覆盖 24 篇报道
  - [x] 添加对应的 emoji 和隐藏叙事 (Narrative)

- [x] **CommentItem 展示身份标签**
  - [x] 组件读取 `identities` 并渲染为可横向滚动的 Chip 列表
  - [x] 实现带叙事标签的蓝色指示点和点击内联展开功能
  - [x] 完善响应式布局，保证不干扰评论阅读

- [x] **视觉与 UI 调整**
  - [x] CSS Variables 适配浅色/暗色模式（暗色使用 #2f3336, 浅色 #e5e3dc）
  - [x] 添加高质量真人配图头强化社交真实感

**Phase 2: 用户个人页面系统** (🚧 进行中)
**状态**: 🟡 开发中
**预估工时**: 6-8 小时
**优先级**: ⭐⭐⭐ 最高

**核心功能**: 点击评论区头像 → 跳转用户个人页面，展示完整身份标签与历史评论

**Phase 2.1: 基础页面实现**（当前优先）
- [ ] **创建 UserProfilePage 组件**
  - [ ] 使用前端路由（URL hash）实现页面导航
  - [ ] 显示用户头像、名字、完整身份标签
  - [ ] 所有身份标签平铺展示（比评论区更突出）
  - [ ] 带 narrative 的标签可点击展开

- [ ] **评论历史列表**
  - [ ] 显示该用户的所有评论（按时间倒序）
  - [ ] 每条评论包含：内容、时间、所属报道标题
  - [ ] 报道标题可点击，跳转回该报道页面
  - [ ] 显示报道的主题标签（Gun Control / Abortion / Climate）

- [ ] **导航与交互**
  - [ ] CommentItem 的头像可点击
  - [ ] 返回按钮回到之前位置
  - [ ] 响应式设计（移动端 + 桌面端）

**Phase 2.2: 增强功能**（效果满意后）
- [ ] 按主题 Tab 切换查看（All / Gun Control / Abortion / Climate）
- [ ] 轻量级"人设概览"文本（自动从身份标签生成）
- [ ] Narrative 展开动画优化
- [ ] 页面过渡动画

**Phase 2.3: Supabase 集成**（🚧 当前优先）
**状态**: 🟡 规划中
**预估工时**: 4-6 小时
**优先级**: ⭐⭐⭐ 最高

**核心任务**: 将 ProfilePage 与 Supabase 认证系统集成，支持登录用户存储身份标签

- [x] **修改 Supabase Schema** ✅ 完成于 2026-03-08
  - [x] 在 `profiles` 表添加 `identities` 列（JSONB 类型）
  - [x] 创建索引优化查询性能
  - 📄 脚本: `scripts/supabase-add-identities.sql`

- [x] **更新类型定义** ✅ 完成于 2026-03-08
  - [x] `UserProfile.identities` 改为必填（非可选）
  - [x] `ProfileRow.identities` 更新为 `IdentityTag[]`
  - [x] `mapProfile` 默认值改为 `[]`

- [x] **更新 AuthContext** ✅ 完成于 2026-03-08
  - [x] 修改 `handleUpdateProfile` 支持 `identities` 字段
  - [x] 添加类型定义：`identities: IdentityTag[]`

- [x] **改造 ProfilePage** ✅ 完成于 2026-03-08
  - [x] 集成 `useAuth()` hook 检查登录状态
  - [x] 已登录：从 Supabase 读取/保存 identities
  - [x] 未登录：继续使用 localStorage Guest 模式
  - [x] 添加登录状态提示 UI (guestNotice 样式)

- [x] **导入 Mock 用户数据** ✅ 完成于 2026-03-08
  - [x] 将 `app-data.json` 中的 12 个 mockUsers 导入到 `profiles` 表
  - [x] 创建测试账号（12 个用户，密码: pass1234）
  - [x] 验证数据完整性（identities, avatarUrl, display_name）
  - 📄 脚本: `scripts/import-mock-users-simple.sql`
  - 📘 指南: `scripts/MOCK_USERS_IMPORT_GUIDE.md`

- [x] **测试完整流程** ✅ 完成于 2026-03-08
  - [x] 未登录状态：Guest User + localStorage
  - [x] 登录后：Supabase 用户 + 数据库持久化
  - [x] 编辑并保存身份标签
  - [x] 刷新页面数据保留
  - [x] 构建成功 (`npm run build`)

---

##### ✅ Phase 2.4: 评论数据导入（Supabase 集成）
**状态**: ✅ 已完成
**预估工时**: 2-3 小时
**完成时间**: 2026-03-08

**核心任务**: 将评论数据导入 Supabase，实现 ProfilePage 和 CommentSection 读取真实数据

- [x] **创建 Comments 表（如未创建）**
  - [x] 验证 `comments` 表存在并包含必要字段
  - [x] 字段：`id`, `report_id`, `user_id`, `content`, `created_at`
  - [x] 添加外键约束（`user_id` → `profiles.id`）
  - 📄 脚本：`scripts/verify-comments-table.sql`

- [x] **导入 Mock 评论数据**
  - [x] 将 `app-data.json` 中的 73 条 mockComments 导入到 `comments` 表
  - [x] 自动匹配 `userId` 到实际的 profile UUID
  - [x] 验证外键关联正确
  - 📄 脚本：`scripts/import-mock-comments.sql` (自动生成)
  - 🛠️ 生成工具：`scripts/generate-comment-import-sql.cjs`

- [x] **更新 ProfilePage 读取真实评论**
  - [x] 替换第 83-86 行的空数组返回
  - [x] 实现 Supabase 查询：关联 `comments` + `reports` + `topics`
  - [x] 支持优雅降级到 `app-data.json`
  - [x] 按时间倒序显示评论历史
  - 📄 文件：[src/components/ProfilePage.tsx](src/components/ProfilePage.tsx#L84-L168)

- [x] **CommentSection 已支持真实评论**
  - [x] 已从 Supabase 读取评论数据（Phase 2.3 已实现）
  - [x] 已保留静态数据降级方案（fallback）

- [x] **构建验证**
  - [x] TypeScript 编译通过
  - [x] Vite 构建成功
  - [x] 无运行时错误

**参考文档**:
- 📘 [导入指南](scripts/COMMENT_IMPORT_GUIDE.md)
- 📘 Supabase 数据库 schema 文档

**🎯 下一步**: Phase 3 - Path B 共识可视化功能实现

---

**Phase 3: 完全迁移到 Supabase**（v0.4.0 或更晚）
- [ ] 移除 localStorage 降级方案
- [ ] 删除 `profiles` 表的 `city`, `profession`, `interests` 旧字段
- [ ] 用户可自主注册并编辑身份标签
- [ ] 实现完整的 CRUD 操作

**参考文档**: `docs/02-Path-C-交叉身份/设计规范.md`

---

##### 📊 扩充示例数据（Demo 用）
**状态**: 🟡 可选
**预估工时**: 4-6 小时

- [ ] 再添加 1-2 个主题（Immigration / Healthcare）
- [ ] 每个主题 5-8 篇报道即可（Demo 展示用）
- [ ] 收集对应的真实民调数据

---

#### 🟢 中优先级（Demo 润色）

##### 🎨 UI/UX 增强
- [ ] 图表加载骨架屏
- [ ] 身份标签动画效果
- [ ] 移动端适配优化
- [ ] 暗色主题完善

---

### 🔮 v0.4.0 - 部署上线 (计划中)
**目标发布**: 2026-03-25
**里程碑**: Demo 公开可访问

**核心任务**:
- [ ] 生产环境配置
- [ ] Vercel/Netlify 部署
- [ ] 域名绑定（可选）
- [ ] 性能优化（代码分割、图片优化）
- [ ] SEO 优化（Open Graph、meta 标签）
- [ ] 错误监控（Sentry 等）

---

### 🔮 v0.5.0 - News Agent 自动采集 (计划中)
**目标发布**: 2026-04-15
**里程碑**: 从静态数据到动态采集

**核心功能**:
- [ ] 新闻源爬虫（RSS/API）
  - [ ] 主流媒体 RSS 订阅
  - [ ] NewsAPI / MediaStack 集成
- [ ] 自动主题标注
  - [ ] 使用 matchers.ts 关键词匹配
  - [ ] 可选：GPT-4 语义分类
- [ ] 内容去重与过滤
- [ ] 定时任务调度（每日更新）

**参考文档**: `docs/03-News-Agent/设计规范.md`

**注**: News Agent 之后，主题匹配算法优化才成为必要

---

### 🔮 v1.0.0 - 研究就绪版 (计划中)
**目标发布**: 2026-05-01
**里程碑**: 可用于实验的完整系统

**核心功能**:
- [ ] 主题匹配算法优化（基于 News Agent 的实际数据）
  - [ ] ML-based 主题分类
  - [ ] 多主题支持
  - [ ] 匹配置信度
- [ ] A/B 测试框架
- [ ] 用户行为分析与数据导出
- [ ] 性能优化与压力测试

---

## 🔄 后期优化任务 (v1.0+ 阶段)

### 主题匹配算法优化
**优先级**: 低（News Agent 之后）
**说明**: 当前静态数据下，主题匹配不是必需的。只有启用 News Agent 自动采集后才需要。

- [ ] 完善 `matchers.ts` 关键词匹配
- [ ] 基于 ML 的主题分类（GPT-4 / 本地模型）
- [ ] 多主题支持（一篇报道匹配多个主题）
- [ ] 匹配置信度评分

### Supabase 数据迁移
**优先级**: 低（Demo 阶段不需要）
**当前方案**: 静态 JSON（app-data.json）

- [ ] 创建 `topics` 表
- [ ] 创建 `polling_data` 表
- [ ] 更新 `reports` 表 schema
- [ ] 数据迁移脚本
- [ ] 更新 App.tsx 使用数据库

### 分析与监控
- [ ] 追踪用户最关注的主题
- [ ] 追踪"单看数据" vs "单看分析"点击率
- [ ] A/B 测试不同桥接文本的效果
- [ ] Path B vs Path C 效果对比

---

## 📊 当前状态面板

| 功能模块 | 状态 | 进度 | 优先级 | 预计完成 |
|---------|------|------|--------|----------|
| Path B Phase 1-2 | ✅ 完成 | 100% | - | 2026-03-07 |
| Path C Phase 1 | ✅ 完成 | 100% | - | 2026-03-07 |
| **Path C Phase 2** | 🟡 进行中 | 10% | ⭐⭐⭐ 最高 | 2026-03-20 |
| Demo 部署 | 🔵 计划中 | 0% | ⭐⭐ 高 | 2026-03-25 |
| News Agent | 🔵 计划中 | 0% | ⭐ 中 | 2026-04-15 |
| 算法优化 | 🔵 计划中 | 0% | - | 2026-05-01 |

**图例**: ✅ 完成 | 🟡 进行中 | 🔵 计划中 | 🔴 受阻

**当前焦点**: Path C Phase 2 - 用户个人页面系统（v0.3.0）

---

## 📝 工作流程规范

### 新增功能/任务时
1. 在 `ROADMAP.md` 对应版本下添加任务条目
2. 更新 `CLAUDE.md` 的当前任务列表
3. 如有设计变更，更新 `docs/00-Overview/设计更新日志.md`

### 完成任务后
1. 在 `ROADMAP.md` 中标记为完成（✅）
2. 更新 `CLAUDE.md` 移除已完成任务
3. 更新相关文档的实施计划
4. 提交代码并创建 PR

### 版本发布时
1. 更新 `package.json` 版本号
2. 在 `docs/00-Overview/设计更新日志.md` 记录版本变更
3. 在 `ROADMAP.md` 标记版本为完成
4. 创建 Git tag

---

## 🔗 相关文档

- [产品设计文档](docs/00-Overview/产品设计文档.md) - 研究动机与核心功能
- [技术设计文档](docs/00-Overview/技术设计文档.md) - 系统架构与数据库设计
- [设计更新日志](docs/00-Overview/设计更新日志.md) - 版本迭代历史
- [Path B 实施计划](docs/01-Path-B-共识可视化/实施计划.md) - Phase 1-4 详细步骤
- [CLAUDE.md](CLAUDE.md) - AI 助手工作上下文

---

**最后更新**: 2026-03-07
**当前分支**: `feature/path-b-consensus-visualization` → 待合并到 `develop`
