// ========== Path B: Consensus Visualization Types ==========

// Subtopic (子议题) - granular topics under a main Topic
export interface Subtopic {
  id: string;              // e.g., "us-gun-control-background-checks"
  name: string;            // e.g., "Background Checks"
  tagKeywords: string[];   // Keywords for matching reports to this subtopic
}

// Topic (议题) - replaces Event
export interface Topic {
  id: string;              // e.g., "us-gun-control"
  name: string;            // e.g., "Gun Control"
  scope: 'us_domestic' | 'cross_national';
  tagKeywords: string[];   // Keywords for matching reports to this topic
  subtopics?: Subtopic[];  // Optional: granular subtopics
}

// Polling Data (民调数据) - replaces Distribution
export interface PollingData {
  id: string;
  topicId: string;         // Links to Topic.id or Subtopic.id
  subtopicId?: string;     // Optional: if this polling data is for a specific subtopic
  source: string;          // e.g., "Pew Research Center"
  surveyYear: number;      // e.g., 2024
  geographicScope: string; // e.g., "US"
  scaleLabels: string[];   // 4-7 levels, e.g., ["Illegal in all cases", "Legal in most cases", ...]
  distribution: number[];  // Percentages, same length as scaleLabels
  bridgingText: string;    // Intro text for the chart
}

// Report (报道) - updated for Path B
export interface Report {
  id: string;
  topicId?: string;        // Optional: links to Topic.id (fallback if no subtopic match)
  subtopicId?: string;     // Optional: links to Subtopic.id (preferred, more granular)
  title: string;
  summary: string;
  source: string;          // Media source name (e.g., "CNN", "NPR")
  url?: string;
  publishedAt?: string;
  imageUrl?: string;
}

// Data structure
export interface AppData {
  topics: Topic[];
  pollingData: PollingData[];
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
