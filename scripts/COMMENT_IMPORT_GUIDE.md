# 评论数据导入指南

> **Phase 2.4**: 将 mock 评论数据从 `app-data.json` 导入到 Supabase `comments` 表

---

## 📋 前置条件

在执行导入脚本前，请确认：

- ✅ **Supabase 项目已配置** (已在 Phase 2.3 完成)
- ✅ **12 个测试用户已导入** (`scripts/import-mock-users-simple.sql` 已执行)
- ✅ **`comments` 表已创建** (见技术设计文档第 238-247 行)
- ✅ **`reports` 表已创建并包含数据** (评论需要关联到报道)

---

## 🔍 Step 1: 验证 Comments 表 Schema

在 Supabase Dashboard → SQL Editor 中执行：

```bash
scripts/verify-comments-table.sql
```

**预期输出**：

```
column_name  | data_type   | column_default      | is_nullable
-------------|-------------|---------------------|-------------
id           | uuid        | gen_random_uuid()   | NO
report_id    | text        | NULL                | NO
user_id      | uuid        | NULL                | NO
content      | text        | NULL                | NO
created_at   | timestamptz | now()               | YES
```

**外键约束**：
- `report_id` → `reports(id)`
- `user_id` → `profiles(id)`

**索引**：
- `comments_pkey` (PRIMARY KEY on id)
- `idx_comments_report_id` (on report_id)
- `idx_comments_user_id` (on user_id)

如果表不存在，请先在 Supabase Dashboard 中创建表（参考技术设计文档）。

---

## 📥 Step 2: 导入 Mock 评论数据

### 2.1 执行导入脚本

在 Supabase Dashboard → SQL Editor 中执行：

```bash
scripts/import-mock-comments.sql
```

这个脚本会：
1. 导入 **73 条评论** 到 `comments` 表
2. 自动将 `userId` (`user-01` → `user-12`) 映射到 Supabase UUID
3. 关联到对应的 `report_id`

### 2.2 验证导入结果

脚本执行后会自动运行验证查询，预期输出：

```sql
SELECT
  COUNT(*) as total_comments,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT report_id) as unique_reports
FROM comments;
```

**预期结果**：
- `total_comments`: **73**
- `unique_users`: **12**
- `unique_reports`: 约 20-30 个 (取决于 reports 表中的数据)

### 2.3 查看示例评论

```sql
SELECT
  c.id,
  c.report_id,
  p.display_name,
  LEFT(c.content, 60) || '...' as content_preview,
  c.created_at
FROM comments c
JOIN profiles p ON c.user_id = p.id
ORDER BY c.created_at DESC
LIMIT 10;
```

---

## 🧪 Step 3: 测试前端显示

### 3.1 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5176

### 3.2 测试流程

1. **登录测试账号**
   - Email: `mike.thompson@example.com`
   - Password: `pass1234`

2. **进入 Profile Page**
   - 点击右上角用户头像
   - 查看 "Comments" 部分

3. **验证评论显示**
   - ✅ 应该显示 Mike Thompson 的所有评论 (约 5-10 条)
   - ✅ 每条评论应该显示：
     - 评论内容
     - 发布时间 (相对时间，如 "2d ago")
     - 关联的报道标题 (可点击)
     - 主题标签 (如果有)

4. **测试其他用户**
   - 登出，切换到其他测试账号
   - 验证每个用户只能看到自己的评论

---

## 📂 关键文件说明

| 文件 | 用途 |
|------|------|
| `verify-comments-table.sql` | 验证 comments 表 schema |
| `generate-comment-import-sql.cjs` | Node.js 脚本，生成 SQL 导入语句 |
| `import-mock-comments.sql` | 导入 73 条评论的 SQL 脚本 (自动生成) |
| `src/components/ProfilePage.tsx` | 前端组件，显示用户评论历史 |

---

## 🔄 重新生成导入脚本 (可选)

如果 `app-data.json` 中的 `mockComments` 数据有更新，可以重新生成导入脚本：

```bash
node scripts/generate-comment-import-sql.cjs > scripts/import-mock-comments.sql
```

---

## 🐛 常见问题

### Q1: 导入时报错 "foreign key constraint violation"

**原因**: `user_id` 或 `report_id` 在对应的表中不存在。

**解决方案**:
1. 确认 12 个测试用户已导入 (`SELECT COUNT(*) FROM profiles;` 应返回至少 12)
2. 确认 reports 表中包含对应的 `report_id` (`SELECT id FROM reports WHERE id LIKE 'rp_%';`)

### Q2: ProfilePage 不显示评论

**原因**: Supabase 查询失败或用户 ID 不匹配。

**调试步骤**:
1. 打开浏览器开发者工具 → Console
2. 查看是否有错误信息 ("Error fetching user comments")
3. 手动查询 Supabase:
   ```sql
   SELECT * FROM comments WHERE user_id = (
     SELECT id FROM profiles WHERE email = 'mike.thompson@example.com'
   );
   ```

### Q3: 评论关联的 report 或 topic 为空

**原因**: Supabase 查询的 JOIN 语句可能有问题，或 `reports` 表中缺少 `topic_id`。

**解决方案**:
1. 确认 `reports` 表中的数据包含 `topic_id` 字段
2. 确认 `topics` 表已创建并包含数据
3. 检查 ProfilePage.tsx 中的 Supabase 查询语句

---

## ✅ 完成标准

- [ ] `comments` 表包含 **73 条评论**
- [ ] 所有评论正确关联到 `user_id` (UUID)
- [ ] 所有评论正确关联到 `report_id`
- [ ] ProfilePage 显示当前用户的评论历史
- [ ] 评论关联信息显示正确 (report 标题、topic 标签)
- [ ] 构建成功 (`npm run build`)

---

**创建日期**: 2026-03-08
**Phase**: 2.4 - 评论数据导入到 Supabase
**下一步**: Phase 3 - Path B 功能实现
