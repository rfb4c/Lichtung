# 数据导入指南 | Data Import Guide

> **Phase 2.4: 评论数据导入（Supabase 集成）**
> **创建时间**: 2026-03-08
> **前置条件**: Phase 2.3 已完成（用户数据已导入）

---

## 📋 导入顺序（重要！）

由于外键依赖关系，**必须按以下顺序执行**：

```
1. import-all-data.sql        ← 导入 topics, events, reports, polling_data
2. import-mock-comments.sql   ← 导入 comments（依赖 reports 和 users）
```

---

## 🚀 快速执行

### Step 0: 创建必要的表（首次执行）

**如果你的 Supabase 还没有 `topics` 和 `polling_data` 表，必须先执行此步骤**

1. 打开 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择项目 → SQL Editor
3. 复制 `scripts/create-path-b-tables.sql` 内容
4. 点击 **Run**

**预期结果**：显示表结构验证，应该看到 `topics` 和 `polling_data` 表

---

### Step 1: 导入基础数据

1. 继续在 SQL Editor
2. 复制 `scripts/import-all-data.sql` 内容
3. 点击 **Run**

**预期结果**：
```
Topics: 3
Events: 1
Reports: 24
Polling Data: 9
```

---

### Step 2: 导入评论数据

1. 继续在 SQL Editor
2. 复制 `scripts/import-mock-comments.sql` 内容
3. 点击 **Run**

**预期结果**：
```
total_comments: 73
unique_users: 12
unique_reports: 24
```

---

## 📊 数据概览

| 表名 | 记录数 | 说明 |
|------|--------|------|
| `topics` | 3 | Gun Control, Abortion, Climate |
| `events` | 1 | 虚拟 event（legacy 兼容） |
| `reports` | 24 | 每个主题 8 篇报道 |
| `polling_data` | 9 | 真实 Pew/KFF 民调数据 |
| `comments` | 73 | 73 条评论分布在 24 篇报道中 |
| `profiles` | 12 | 已在 Phase 2.3 导入 |

---

## 🔍 验证数据完整性

执行以下查询检查外键关联：

```sql
-- 1. 检查所有 reports 都有关联的 topic
SELECT
  COUNT(*) as total_reports,
  COUNT(topic_id) as reports_with_topic
FROM reports;
-- 应该相等（都是 24）

-- 2. 检查所有 comments 都有有效的 user 和 report
SELECT
  COUNT(*) as total_comments,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT report_id) as unique_reports
FROM comments;
-- total: 73, users: 12, reports: 24

-- 3. 查看每篇报道的评论数
SELECT
  r.id,
  r.title,
  COUNT(c.id) as comment_count
FROM reports r
LEFT JOIN comments c ON c.report_id = r.id
GROUP BY r.id, r.title
ORDER BY comment_count DESC;
```

---

## ⚠️ 常见问题

### Q1: 执行 import-all-data.sql 时报错 "relation does not exist"

**原因**: `topics` 或 `polling_data` 表尚未创建（Path B 表）

**解决方案**:
```bash
# 先执行建表脚本
执行 scripts/create-path-b-tables.sql

# 然后再执行导入脚本
执行 scripts/import-all-data.sql
```

---

### Q2: 评论导入失败 "foreign key violation"

**原因**: reports 表为空或 user_id 不存在

**解决方案**:
1. 确认先执行 `import-all-data.sql`
2. 确认 Phase 2.3 的 `import-mock-users.sql` 已执行
3. 检查 reports 表:
```sql
SELECT COUNT(*) FROM reports; -- 应该是 24
SELECT COUNT(*) FROM profiles; -- 应该是 12
```

---

### Q3: 想要重新导入数据

**解决方案**:
```sql
-- 按依赖顺序清空（CASCADE 会自动清理相关数据）
DELETE FROM comments;
DELETE FROM polling_data;
DELETE FROM reports;
DELETE FROM topics;
DELETE FROM events;

-- 然后重新执行导入脚本
```

---

## 🎯 下一步

导入完成后：

1. **测试前端读取**:
   - 访问 ProfilePage → 应该显示用户的评论历史
   - 访问 CommentSection → 应该显示报道的评论
   - 检查 DistributionChart → 应该显示民调数据

2. **更新 ROADMAP.md**:
   - 标记 Phase 2.4 所有任务为 ✅
   - 记录完成时间

3. **提交代码**:
   ```bash
   git add scripts/import-all-data.sql scripts/import-mock-comments.sql scripts/DATA_IMPORT_GUIDE.md
   git commit -m "feat(path-c): complete Phase 2.4 - import comments and reports to Supabase"
   ```

---

## 📝 技术说明

### 为什么需要 event_id?

`event_id` 是 v0.1.0 的遗留字段。虽然 v0.2.0 重构为 topic-based 架构，但表结构尚未完全迁移。我们创建了一个虚拟 event (`ev_default`) 来满足 NOT NULL 约束，避免修改表结构带来的风险。

### 为什么所有 reports 的 stance 都是 'neutral'?

app-data.json 中没有 stance 信息，且 stance 字段在当前 UI 中未使用。我们使用 'neutral' 作为默认值满足数据库约束。

---

**文档版本**: v1.0
**关联任务**: ROADMAP.md § Path C Phase 2.4
**相关脚本**: `import-all-data.sql`, `import-mock-comments.sql`
