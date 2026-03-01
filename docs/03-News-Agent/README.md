# 03-News-Agent - 新闻采集 Agent

**功能定位**：自动搜集新闻报道并打议题标签，为路径 B（共识可视化）和路径 C（交叉身份）提供数据支撑。

## 📄 核心文档

### [设计规范.md](./设计规范.md)
**必读文档**，包含：
- Agent 架构与工作流
- 输入/输出格式规范
- 议题标签分类逻辑（如何判断报道属于哪个议题）
- 数据质量要求（摘要长度、来源可信度）
- 与 Supabase 的集成方式

## 🎯 实施检查清单

- [ ] 定义 Agent 使用的 LLM（Gemini Deep Research 或其他）
- [ ] 编写 Agent Prompt（输入：关键词；输出：结构化 JSON）
- [ ] 实现议题标签分类逻辑（基于预定义的议题库）
- [ ] 验证输出格式（确保字段与 Supabase schema 匹配）
- [ ] 测试数据质量（摘要可读性、来源准确性）
- [ ] 自动化入库脚本（JSON → Supabase INSERT）

## 📊 输出数据格式

```json
{
  "reports": [
    {
      "id": "rp_xxx",
      "event_id": "ev_xxx",
      "title": "报道标题",
      "summary": "100-200字摘要",
      "source": "国内/国外",
      "stance": "supportive/neutral/opposed",
      "topic_id": "us-gun-control",  // 新增：议题标签
      "image_url": "https://...",
      "published_at": "2小时前"
    }
  ]
}
```

## 🔗 相关文档

- 上游：[技术设计文档 § 数据流](../00-Overview/技术设计文档.md)
- 下游：[Path-B 操作手册](../01-Path-B-共识可视化/操作手册.md)（数据采集标准）

## 💡 未来扩展

- 自动化定时运行（每日抓取）
- 多来源聚合（跨媒体平台）
- 立场自动判断（基于内容语义）
- 事件聚类（自动归并同一议题的报道）
