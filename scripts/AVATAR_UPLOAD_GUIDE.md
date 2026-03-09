# 头像上传功能配置指南

## 📋 概述

已为 ProfilePage 添加头像上传功能。用户可以：
- 上传自定义头像（仅登录用户）
- 预览头像图片
- 删除已上传的头像

## 🔧 Supabase Storage 配置

### 步骤 1: 创建 Storage Bucket

在 Supabase Dashboard → SQL Editor 中执行：

```bash
# 文件位置
scripts/supabase-create-avatar-storage.sql
```

该脚本会：
1. 创建名为 `avatars` 的公共 bucket
2. 设置 RLS 策略：
   - 任何人可以读取头像（公共访问）
   - 认证用户可以上传自己的头像
   - 用户可以更新/删除自己的头像

### 步骤 2: 验证配置

执行脚本后，检查：

```sql
SELECT * FROM storage.buckets WHERE id = 'avatars';
```

应该返回一条记录，`public` 字段为 `true`。

## 🎨 功能说明

### 上传流程

1. 用户进入 ProfilePage 并点击 "Edit Profile"
2. 在编辑模式下，看到头像上传区域
3. 点击 "Upload Image" 选择图片文件
4. 预览图片
5. 点击 "Save Changes" 上传到 Supabase Storage

### 文件限制

- **类型**: 仅支持图片文件 (image/*)
- **大小**: 最大 2MB
- **存储路径**: `avatars/{user_id}/{timestamp}.{ext}`

### Guest 模式

- Guest 用户（未登录）**不能上传头像**
- 如果尝试上传，会提示需要登录

## 📁 文件变更

### 新增文件
- `scripts/supabase-create-avatar-storage.sql` - Storage bucket 配置脚本

### 修改文件
- `src/components/ProfilePage.tsx` - 添加上传逻辑和 UI
- `src/components/UserProfilePage.module.css` - 添加样式
- `src/contexts/AuthContext.tsx` - 支持 avatarUrl 更新

## 🧪 测试清单

- [ ] 执行 SQL 脚本创建 storage bucket
- [ ] 登录用户账户
- [ ] 进入 Profile 页面并点击 Edit
- [ ] 上传头像图片（< 2MB）
- [ ] 验证预览显示正确
- [ ] 保存并检查头像是否更新
- [ ] 刷新页面，头像应持久化显示
- [ ] 测试删除头像功能
- [ ] 验证 Guest 用户不能上传

## ⚠️ 注意事项

1. **必须先配置 Supabase Storage**：执行 `supabase-create-avatar-storage.sql`
2. **文件大小**：前端限制 2MB，如需调整可修改 ProfilePage.tsx 第255行
3. **安全性**：RLS 策略确保用户只能修改自己的头像
4. **路径结构**：头像存储在 `avatars/{user_id}/` 下，便于管理

## 🔗 相关资源

- [Supabase Storage 文档](https://supabase.com/docs/guides/storage)
- [RLS 策略指南](https://supabase.com/docs/guides/auth/row-level-security)
