// 事件（一个热点话题）
export interface Event {
  id: string;
  title: string;  // 如 "禁燃油车政策"
  distribution: Distribution;
}

// 立场分布（百分比）
export interface Distribution {
  supportive: number;  // 支持，如 25 表示 25%
  neutral: number;     // 中立
  opposed: number;     // 反对
}

// 立场类型
export type Stance = 'supportive' | 'neutral' | 'opposed';

// 来源类型
export type Source = '国内' | '外媒';

// 报道（一篇新闻）
export interface Report {
  id: string;
  eventId: string;     // 关联 Event.id
  title: string;       // 报道标题
  summary: string;     // 摘要（100-200字）
  source: Source;      // 来源
  stance: Stance;      // 立场
  url?: string;        // 可选：原文链接
  publishedAt?: string; // 可选：发布时间
  imageUrl?: string;   // 可选：报道配图
}

// 完整数据结构
export interface EventsData {
  events: Event[];
  reports: Report[];
}

// 用户资料（映射 profiles 表）
export interface UserProfile {
  id: string;
  displayName: string;
  avatarUrl?: string;
  city?: string;          // Path C 身份字段
  profession?: string;    // Path C 身份字段
  interests: string[];    // Path C 身份标签
}

// 评论
export interface Comment {
  id: string;
  reportId: string;
  userId: string;
  content: string;
  createdAt: string;
  profile?: UserProfile;
}
