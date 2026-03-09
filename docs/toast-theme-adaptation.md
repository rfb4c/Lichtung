# Toast 通知系统主题适配

## 🎨 更新内容

Toast 通知现在完全适配项目的暗色/浅色主题系统。

---

## 🌗 主题适配细节

### 使用的 CSS 变量

| 元素 | CSS 变量 | 暗色模式值 | 浅色模式值 |
|------|---------|-----------|-----------|
| 背景 | `--color-surface` | `#252526` | `#ffffff` |
| 边框 | `--color-border` | `#3c3c3c` | `#dfe1e5` |
| 文字 | `--color-text-primary` | `#d4d4d4` | `#2c3e50` |
| 次要文字 | `--color-text-secondary` | `#858585` | `#6c7a89` |
| 悬停背景 | `--color-hover` | `#2a2d2e` | `#f0f2f5` |

### Toast 类型颜色

| 类型 | 变量/颜色 | 暗色模式 | 浅色模式 |
|------|----------|---------|---------|
| ✅ Success | `--color-supportive` | `#4CAF50` | `#2e7d32` |
| ❌ Error | `--color-opposed` | `#F44336` | `#c62828` |
| ⚠️ Warning | 自定义橙色 | `#f59e0b` | `#d97706` (更深) |
| ℹ️ Info | `--color-primary` | `#4A9D74` | `#2D6A4F` |

---

## 📊 视觉对比

### 暗色模式（默认）
- **背景**: 深灰色 `#252526`
- **阴影**: 深色 `0 4px 12px rgba(0, 0, 0, 0.15)`
- **边框**: 深灰 `#3c3c3c`
- **文字**: 浅灰 `#d4d4d4`

### 浅色模式（`data-theme="light"`）
- **背景**: 纯白 `#ffffff`
- **阴影**: 浅色 `0 2px 8px rgba(0, 0, 0, 0.08)`（更柔和）
- **边框**: 浅灰 `#dfe1e5`
- **文字**: 深蓝灰 `#2c3e50`
- **Warning 颜色**: 调深为 `#d97706`（提高对比度）

---

## 🔧 技术实现

### 1. 基础主题适配
使用项目的 CSS 变量替代硬编码颜色：

```css
/* 之前（硬编码） */
.toast {
  background: white;
  color: #000;
}

/* 现在（变量） */
.toast {
  background: var(--color-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}
```

### 2. 浅色模式特定样式
针对浅色模式调整阴影和 warning 颜色：

```css
[data-theme="light"] .toast {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08),
              0 1px 2px rgba(0, 0, 0, 0.04);
}

[data-theme="light"] .warning {
  border-left-color: #d97706;  /* 更深的橙色 */
}

[data-theme="light"] .warning .icon {
  color: #d97706;
}
```

### 3. 自动切换
Toast 自动跟随项目的主题设置：
- 暗色模式：默认样式（`:root` CSS 变量）
- 浅色模式：`[data-theme="light"]` 选择器覆盖

---

## ✅ 测试清单

### 暗色模式
- [ ] Toast 背景为深灰色 `#252526`
- [ ] 文字清晰可读（浅灰色）
- [ ] Success 提示为绿色 `#4CAF50`
- [ ] Error 提示为红色 `#F44336`
- [ ] Warning 提示为橙色 `#f59e0b`
- [ ] Info 提示为森林绿 `#4A9D74`
- [ ] 阴影深色且明显

### 浅色模式
- [ ] Toast 背景为纯白 `#ffffff`
- [ ] 文字清晰可读（深蓝灰色）
- [ ] Success 提示为深绿色 `#2e7d32`
- [ ] Error 提示为深红色 `#c62828`
- [ ] Warning 提示为深橙色 `#d97706`
- [ ] Info 提示为深森林绿 `#2D6A4F`
- [ ] 阴影浅色且柔和

### 交互测试
- [ ] 悬停关闭按钮，背景色正确变化
- [ ] 主题切换时，已显示的 Toast 立即更新样式
- [ ] 边框颜色与背景对比适当

---

## 🎯 设计原则

### 1. 语义化颜色
- **Success/Error**: 使用项目已定义的 `--color-supportive` 和 `--color-opposed`
- **Info**: 使用主色 `--color-primary`
- **Warning**: 保留橙色（项目未定义 warning 变量）

### 2. 对比度优化
- **浅色模式**: Warning 颜色加深（`#f59e0b` → `#d97706`），提高可读性
- **阴影层次**: 浅色模式使用柔和阴影，暗色模式使用深色阴影

### 3. 一致性
- 所有颜色与项目整体设计系统保持一致
- 自动跟随主题切换，无需手动干预

---

## 📁 修改文件

- **`src/components/ToastContainer.module.css`**
  - 替换所有硬编码颜色为 CSS 变量
  - 添加 `[data-theme="light"]` 浅色模式样式
  - 优化阴影和对比度

---

## 🔮 未来改进

### 可选增强
- [ ] 为 Warning 添加 CSS 变量（`--color-warning`）
- [ ] 支持自定义主题配色
- [ ] 添加主题切换过渡动画
- [ ] 支持用户自定义 Toast 颜色

---

**更新时间**: 2026-03-08
**构建状态**: ✅ 成功
**主题系统**: 完全适配
