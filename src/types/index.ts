// ========== Path B: Moderate Majority Visualization Types ==========

// Subtopic (子议题) - granular topics under a main Topic
export interface Subtopic {
  id: string;              // e.g., "us-gun-control-background-checks"
  name: string;            // e.g., "Background Checks"
  tagKeywords: string[];   // Descriptors of what this subtopic covers; fed to the retrieval pipeline
}

// Topic (议题) - replaces Event
export interface Topic {
  id: string;              // e.g., "us-gun-control"
  name: string;            // e.g., "Gun Control"
  scope: 'us_domestic' | 'cross_national';
  tagKeywords: string[];   // Descriptors of what this topic covers; fed to the retrieval pipeline
  subtopics?: Subtopic[];  // Optional: granular subtopics
}

// Polling Data (民调数据) - replaces Distribution
/**
 * 民调数据。
 *
 * 入库判据（scripts/check-polling-consensus.mjs 逐条校验）：
 *   两端 = 分布最外侧两档之和，中间 = 其余所有档之和（含中立档，如果存在）
 *   入库条件：中间 > 两端
 * 讲的故事是「极端立场的人其实很少」，不是「公众站在同一边」。
 * 库里只放温和多数型民调，所以检索层不必再判「这组数据是否呈温和多数」。
 *
 * 溯源字段（questionWording / sourceUrl / fieldDates / sampleSize / population /
 * verifiedBy / verifiedAt）目前是可选的：现存两条是审计之前录入的，尚未补齐。
 * **新增条目必须带齐**，check 脚本会把缺失的条目列出来。
 */
export interface PollingData {
  id: string;
  topicId: string;         // Links to Topic.id or Subtopic.id
  subtopicId?: string;     // Optional: if this polling data is for a specific subtopic

  /**
   * 逐字照抄的英文原题，不要转述。
   * 两个用途：报道→民调检索的核心匹配对象；学术可追溯的关键——读者要能确认
   * 图表上的数字回答的是哪一个问题。
   */
  questionWording?: string;

  source: string;          // e.g., "Pew Research Center"
  /** 指向能看到这组数字的**具体页面**，不是机构首页 */
  sourceUrl?: string;

  surveyYear: number;      // e.g., 2024
  /** 调查执行期，比 surveyYear 精确，e.g., "2024-04-08 – 2024-04-14" */
  fieldDates?: string;
  sampleSize?: number;     // e.g., 8709
  population?: string;     // e.g., "U.S. adults"
  geographicScope: string; // e.g., "US"

  /** 决定它参与哪一级检索：子议题精确命题优先，不成立时回退议题广义命题 */
  level?: 'topic' | 'subtopic';

  scaleLabels: string[];   // 4-7 levels, ordered by direction (one pole → the other)
  distribution: number[];  // Percentages, same length as scaleLabels, sums to 100
  /**
   * DK / 无意见档的原始比例。该档不进 distribution——它先被剔除，
   * 其余档位对有效回答重新归一化。填了这个值，图表下方会注明
   * "among respondents expressing an opinion"。
   */
  dontKnowPct?: number;

  bridgingText: string;    // Intro text for the chart

  /** 数据完整性红线的落实证据：数字只能来自人工核实 */
  verifiedBy?: 'human';
  verifiedAt?: string;     // ISO date, e.g., "2026-08-23"

  /**
   * 录入时的存疑与判断留痕：中立档怎么算的、DK 有没有重新归一、
   * 数字取自 toplines 的哪一页、样本口径与其他条目有何不同。
   *
   * **不渲染到界面**，只供审计与写论文时回查。存在的理由是：录入者遇到模糊之处时
   * 需要一个「说不确定」的合法出口，否则模糊会被悄悄抹平成一个看起来确定的数字。
   */
  uncertainty?: string;
}

// Report (报道) - updated for Path B + Path A
export interface Report {
  id: string;
  topicId?: string;        // Optional: links to Topic.id (fallback if no subtopic match)
  subtopicId?: string;     // Optional: links to Subtopic.id (preferred, more granular)
  pollingDataId?: string | null; // Explicit polling data assignment; null = no chart
  title: string;           // 卡片标题；来源见 titleProvenance
  /**
   * title 这一行是谁写的。
   *
   *   'og:title'  出版方挂出的标题，取自带时间戳的存档快照（站点后缀已剥掉）
   *   'authored'  本项目改写的标题 —— 存档上没有可用的出版方标题
   *
   * 与 summaryProvenance 同一个理由：卡片挂着真实署名，标题若是我们改写的，
   * 读者看到的就是一行安在出版方名下、他们没写过的话。
   */
  titleProvenance?: 'og:title' | 'authored';
  summary: string;         // 卡片正文；来源见 summaryProvenance
  /**
   * summary 这段文字是谁写的。
   *
   *   'og:description' 出版方自己写的社交预览摘要，取自带时间戳的存档快照
   *   'lede'           出版方的正文首段，og 缺失时的回退
   *   'authored'       本项目撰写的摘要 —— 存档上没有任何出版方文本可用
   *
   * 记在数据层而不是只写进文档：卡片上挂着真实署名，这段文字出自出版方还是
   * 出自我们，是读者与审稿人都有权当场查到的事，不该要翻一遍采集记录才知道。
   * 溯源到具体快照见 src/data/source-texts.json 的同 id 条目。
   */
  summaryProvenance?: 'og:description' | 'lede' | 'authored';
  source: string;          // Media source name (e.g., "CNN", "NPR")
  url?: string;
  publishedAt?: string;
  imageUrl?: string;
  // Path A: Feed sorting fields (all optional, backward-compatible)
  csScore?:              number;   // 反刻板范例得分 0–1，由标注管线产出；缺失时回退到 counterStereotypical
  counterStereotypical?: boolean;  // 旧的二值标注；csScore 落地前的回退来源
  engagementScore?:      number;   // simulated engagement for Algorithm feed; default 0.5
}

// ========== Path C: Cross-cutting Identity Types ==========

// 身份标签
export interface IdentityTag {
  id: string;              // e.g., "father"
  layer: 1 | 2 | 3 | 4;   // 四层分类: 1-家庭处境, 2-人生经历, 3-社会角色, 4-生活方式
  label: string;           // 展示文本, e.g., "Father"
  emoji?: string;          // 可选 emoji
  narrative?: string;      // 个人叙事（可为空）
}

// ========== Data Structures ==========

// Data structure
export interface AppData {
  topics: Topic[];
  pollingData: PollingData[];
  reports: Report[];
  mockUsers?: MockUser[];     // Path C: mock users with identity tags
  mockComments?: MockComment[]; // Path C: mock comments for demo
}

// Mock user for static demo (Path C)
export interface MockUser {
  id: string;
  displayName: string;
  email?: string;          // JSON-mode mock login: email → this user
  avatarUrl?: string;
  identities: IdentityTag[];
}

// Mock comment for static demo
export interface MockComment {
  id: string;
  reportId: string;
  userId: string;          // Links to MockUser.id
  content: string;
  createdAt: string;
}

// 用户资料（映射 profiles 表）
export interface UserProfile {
  id: string;
  displayName: string;
  avatarUrl?: string;
  city?: string;
  profession?: string;
  interests: string[];
  identities: IdentityTag[];  // Path C: 交叉身份标签（必填，默认空数组）
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
