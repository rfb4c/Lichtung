# Toast 通知系统实现

## 📋 概述

替换所有 `alert()` 弹窗为优雅的页面内 Toast 通知（显示后自动消失）。

---

## 🆕 新增文件

### 1. `src/contexts/ToastContext.tsx`
Toast 状态管理 Context，提供：
- `showToast(message, type, duration)` - 显示通知
- `hideToast(id)` - 隐藏通知
- `toasts` - 当前所有通知列表

**使用方式**:
```tsx
import { useToast } from '../contexts/ToastContext';

const { showToast } = useToast();

// 成功提示
showToast('Saved successfully', 'success', 2000);

// 错误提示
showToast('Failed to save', 'error');

// 警告提示
showToast('Please check input', 'warning');

// 信息提示
showToast('Loading...', 'info');
```

---

### 2. `src/components/ToastContainer.tsx`
Toast 渲染容器组件，负责：
- 在页面右上角显示所有 toast
- 根据类型显示不同图标和颜色
- 自动消失动画
- 手动关闭按钮

**Toast 类型**:
- `success` - 绿色边框，✓ 图标
- `error` - 红色边框，⚠ 图标
- `warning` - 橙色边框，⚠ 图标
- `info` - 蓝色边框，ℹ 图标

---

### 3. `src/components/ToastContainer.module.css`
Toast 样式，包括：
- 固定定位（右上角）
- 滑入动画
- 响应式设计（移动端适配）
- 暗色模式支持

---

## 🔧 修改文件

### 1. `src/main.tsx`
添加 `ToastProvider` 包裹整个应用：
```tsx
<AuthProvider>
  <ToastProvider>
    <App />
  </ToastProvider>
</AuthProvider>
```

---

### 2. `src/App.tsx`
添加 `<ToastContainer />` 组件到根节点

---

### 3. `src/components/CommentSection.tsx`
替换 `alert()` 调用：
- ❌ `alert('Comment deletion is only available when logged in')`
- ✅ `showToast('Comment deletion is only available when logged in', 'warning')`

**新增提示**:
- 删除成功：绿色成功提示
- 删除失败：红色错误提示

---

### 4. `src/components/ProfilePage.tsx`
替换 5 处 `alert()` 调用：

| 原 alert | 新 Toast | 类型 |
|---------|---------|------|
| 文件类型错误 | `showToast('Please select an image file', 'warning')` | ⚠️ 警告 |
| 文件大小超限 | `showToast('Image size must be less than 2MB', 'warning')` | ⚠️ 警告 |
| 上传失败 | `showToast('Failed to upload avatar...', 'error')` | ❌ 错误 |
| 保存失败 | `showToast('Failed to save: ...', 'error')` | ❌ 错误 |
| Guest 上传限制 | `showToast('Avatar upload is only available...', 'warning')` | ⚠️ 警告 |

**新增成功提示**:
- ✅ `showToast('Profile updated successfully', 'success', 2000)`
- ✅ `showToast('Profile saved locally', 'success', 2000)`

---

## 🎨 设计特性

### 视觉效果
- **位置**: 固定在页面右上角
- **动画**: 从右侧滑入（300ms）
- **持续时间**: 默认 3秒，可自定义
- **堆叠**: 多个通知垂直堆叠，间距 12px

### 交互
- **自动消失**: 倒计时后自动移除
- **手动关闭**: 点击 X 图标立即关闭
- **悬停**: 鼠标悬停时不会消失（可选扩展）

### 响应式
- **桌面端**: 右上角固定，最大宽度 500px
- **移动端**: 全宽显示（左右各 10px 边距）

### 暗色模式
- 自动适配系统暗色模式
- 背景色从白色变为 `var(--color-surface)`
- 阴影加深

---

## 📊 使用统计

**替换 alert 总数**: 7 处
- CommentSection: 2 处
- ProfilePage: 5 处

**新增成功提示**: 3 处
- 评论删除成功
- Profile 更新成功
- Profile 本地保存成功

---

## 🧪 测试要点

### 评论删除
- [ ] 删除成功 → 绿色成功提示
- [ ] 删除失败 → 红色错误提示
- [ ] 未登录删除 → 黄色警告提示

### 头像上传
- [ ] 上传非图片 → 黄色警告提示
- [ ] 图片超 2MB → 黄色警告提示
- [ ] 上传失败 → 红色错误提示
- [ ] 上传成功 + 保存成功 → 绿色成功提示

### Profile 编辑
- [ ] 保存成功 → 绿色成功提示
- [ ] 保存失败 → 红色错误提示
- [ ] Guest 上传限制 → 黄色警告提示

### Toast UI
- [ ] Toast 在右上角显示
- [ ] 自动消失（3 秒）
- [ ] 点击 X 立即关闭
- [ ] 多个 Toast 垂直堆叠
- [ ] 移动端全宽显示
- [ ] 暗色模式正常显示

---

## 🔮 未来扩展

### 可选功能
- [ ] **悬停暂停**: 鼠标悬停时暂停倒计时
- [ ] **进度条**: 显示剩余时间进度条
- [ ] **音效**: 不同类型播放不同提示音
- [ ] **位置配置**: 支持左上、左下、右下等位置
- [ ] **持久化**: 重要提示不自动消失，需手动关闭

### 高级功能
- [ ] **撤销操作**: 删除评论后显示"撤销"按钮
- [ ] **批量操作**: 一次显示多个相关提示
- [ ] **富文本**: 支持链接、按钮等元素
- [ ] **分组**: 同类提示合并显示

---

## 📝 开发笔记

### 为什么不用第三方库？
1. **轻量**: 自定义实现仅增加 ~3KB
2. **控制**: 完全控制样式和行为
3. **一致**: 与项目设计系统完美契合
4. **学习**: 理解 React Context + 动画实现

### 为什么选择右上角？
- **不干扰内容**: Feed 流在中间，右侧是次要区域
- **符合习惯**: 大多数网站通知都在右上角
- **视觉动线**: 用户注意力从左到右，右侧自然

---

**实现时间**: 2026-03-08
**构建状态**: ✅ 成功
**文件变更**: +3 新增，~4 修改
