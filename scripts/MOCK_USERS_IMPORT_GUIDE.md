# Mock 用户导入指南

## 概述

本指南帮助你将 `app-data.json` 中的 12 个模拟用户导入到 Supabase 数据库，并创建真实的认证账号。

## 前提条件

- ✅ Supabase 项目已设置并运行
- ✅ `identities` 列已添加到 `profiles` 表（你已完成 `supabase-add-identities.sql`）

## 方案 1：快速手动导入（推荐，适合 12 个用户）

### 第一步：创建用户账号

打开 **Supabase Dashboard → Authentication → Users → Add User**

创建以下 12 个账号，密码统一使用 `password123`（或你自己设定的测试密码）：

1. `mike.thompson@example.com` - Mike Thompson
2. `sarah.chen@example.com` - Sarah Chen
3. `james.walker@example.com` - James Walker
4. `diana.morales@example.com` - Diana Morales
5. `robert.hayes@example.com` - Robert Hayes
6. `emily.nguyen@example.com` - Emily Nguyen
7. `carlos.ramirez@example.com` - Carlos Ramirez
8. `karen.mitchell@example.com` - Karen Mitchell
9. `david.park@example.com` - David Park
10. `lisa.johnson@example.com` - Lisa Johnson
11. `tom.bradley@example.com` - Tom Bradley
12. `rachel.kim@example.com` - Rachel Kim

**重要**：创建每个用户时，需要在 **User Meta Data** 字段中设置 `display_name`，例如：
```json
{"display_name": "Mike Thompson"}
```
这会触发自动创建 profile 记录。

### 第二步：更新身份标签

创建完所有账号后：

1. 打开 **Supabase Dashboard → SQL Editor**
2. 打开文件 `scripts/import-mock-users.sql`
3. 对每个用户执行以下操作：
   - 从 Authentication 表中获取他们的 UUID
   - 将 `'USER_ID_FROM_AUTH_TABLE'` 替换为实际的 UUID
   - 执行对应的 UPDATE 语句

**示例：**
```sql
UPDATE profiles
SET identities = '[...]'::jsonb
WHERE id = 'a1b2c3d4-5e6f-7g8h-9i0j-k1l2m3n4o5p6';  -- 替换为实际的 UUID
```

### 第三步：验证导入

在 SQL Editor 中运行 `import-mock-users.sql` 底部的验证查询：

```sql
SELECT id, display_name, jsonb_array_length(identities) as tag_count
FROM profiles
WHERE display_name IN (
  'Mike Thompson', 'Sarah Chen', 'James Walker', 'Diana Morales',
  'Robert Hayes', 'Emily Nguyen', 'Carlos Ramirez', 'Karen Mitchell',
  'David Park', 'Lisa Johnson', 'Tom Bradley', 'Rachel Kim'
)
ORDER BY display_name;
```

预期输出：12 行记录，每行的 `tag_count` 在 3-5 之间。

## 方案 2：自动化脚本（未来使用）

对于生产环境或更大规模的数据集，可以使用 Supabase Admin API 自动化创建用户和更新 profile。对于 12 个测试用户来说不需要这么做。

## 功能测试

导入完成后，测试以下功能：

1. **登录为 Mock 用户**：
   - 使用 `mike.thompson@example.com` / `password123` 登录
   - 进入 Profile Page
   - 验证身份标签正确显示

2. **编辑身份标签**：
   - 点击 "Edit Profile"
   - 添加/删除标签
   - 保存更改
   - 刷新页面 → 检查更改是否保留

3. **查看其他用户资料**：
   - 进入 Feed 页面
   - 点击评论头像（例如 Mike Thompson）
   - 验证 UserProfilePage 显示正确的身份标签

4. **Guest 模式**：
   - 登出账号
   - 进入 Profile Page
   - 应显示 "Guest User" 模式
   - 编辑资料 → 保存到 localStorage

## 常见问题排查

### 问题：注册用户后 Profile 没有自动创建

**解决方案**：检查数据库触发器。你应该有一个自动创建 profile 的触发器：

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, interests, identities)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'display_name', 'Anonymous'),
    '{}',
    '[]'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 问题：identities 列不存在

**解决方案**：先执行 `scripts/supabase-add-identities.sql`（你已完成）。

### 问题：JSONB 解析错误

**解决方案**：检查 SQL 中的单引号是否用 `''`（两个单引号）转义。

## 快速参考：邮箱 → 姓名映射表

| 邮箱 | 显示名称 | 标签数量 |
|-------|--------------|------------|
| mike.thompson@example.com | Mike Thompson | 4 |
| sarah.chen@example.com | Sarah Chen | 4 |
| james.walker@example.com | James Walker | 4 |
| diana.morales@example.com | Diana Morales | 4 |
| robert.hayes@example.com | Robert Hayes | 4 |
| emily.nguyen@example.com | Emily Nguyen | 4 |
| carlos.ramirez@example.com | Carlos Ramirez | 5 |
| karen.mitchell@example.com | Karen Mitchell | 3 |
| david.park@example.com | David Park | 4 |
| lisa.johnson@example.com | Lisa Johnson | 4 |
| tom.bradley@example.com | Tom Bradley | 5 |
| rachel.kim@example.com | Rachel Kim | 4 |
