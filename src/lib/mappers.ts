import type { Topic, Report, UserProfile, Comment, IdentityTag } from '../types';

// Supabase row types (snake_case)

export interface TopicRow {
  id: string;
  name: string;
  scope: string;
  tag_keywords: string[];
}

// 民调没有 Row 类型/mapper：app-data.json 是唯一事实源，Supabase 里的
// polling_data 由 scripts/generate-supabase-sync.cjs 从该文件生成，
// 前端一律经 lib/pollingResolver 读本地库，不反向从数据库取。

export interface ReportRow {
  id: string;
  topic_id: string | null;
  polling_data_id?: string | null;
  title: string;
  summary: string;
  source: string;
  url: string | null;
  image_url: string | null;
  published_at: string | null;
  // Path A fields
  counter_stereotypical?: boolean | null;
  engagement_score?:      number | null;
}

export interface ProfileRow {
  id: string;
  display_name: string;
  avatar_url: string | null;
  city: string | null;
  profession: string | null;
  interests: string[];
  identities: IdentityTag[];  // Path C: cross-cutting identity tags (default: [])
}

export interface CommentRow {
  id: string;
  report_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: ProfileRow;
}

// Mapper functions

export function mapTopic(row: TopicRow): Topic {
  return {
    id: row.id,
    name: row.name,
    scope: row.scope as Topic['scope'],
    tagKeywords: row.tag_keywords,
  };
}


export function mapReport(row: ReportRow): Report {
  return {
    id: row.id,
    topicId: row.topic_id ?? undefined,
    pollingDataId: row.polling_data_id !== undefined ? row.polling_data_id : undefined,
    title: row.title,
    summary: row.summary,
    source: row.source,
    url: row.url ?? undefined,
    imageUrl: row.image_url ?? undefined,
    publishedAt: row.published_at ?? undefined,
    counterStereotypical: row.counter_stereotypical ?? false,
    engagementScore:      row.engagement_score      ?? 0.5,
  };
}

export function mapProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url ?? undefined,
    city: row.city ?? undefined,
    profession: row.profession ?? undefined,
    interests: row.interests ?? [],
    identities: row.identities ?? [],
  };
}

export function mapComment(row: CommentRow): Comment {
  return {
    id: row.id,
    reportId: row.report_id,
    userId: row.user_id,
    content: row.content,
    createdAt: row.created_at,
    profile: row.profiles ? mapProfile(row.profiles) : undefined,
  };
}
