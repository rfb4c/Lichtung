import type { Topic, PollingData, Report, UserProfile, Comment, IdentityTag } from '../types';

// Supabase row types (snake_case)

export interface TopicRow {
  id: string;
  name: string;
  scope: string;
  tag_keywords: string[];
}

export interface PollingDataRow {
  id: string;
  topic_id: string;
  source: string;
  survey_year: number;
  geographic_scope: string;
  scale_labels: string[];
  distribution: number[];
  bridging_text: string;
}

export interface ReportRow {
  id: string;
  topic_id: string | null;
  title: string;
  summary: string;
  source: string;
  url: string | null;
  image_url: string | null;
  published_at: string | null;
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

export function mapPollingData(row: PollingDataRow): PollingData {
  return {
    id: row.id,
    topicId: row.topic_id,
    source: row.source,
    surveyYear: row.survey_year,
    geographicScope: row.geographic_scope,
    scaleLabels: row.scale_labels,
    distribution: row.distribution,
    bridgingText: row.bridging_text,
  };
}

export function mapReport(row: ReportRow): Report {
  return {
    id: row.id,
    topicId: row.topic_id ?? undefined,
    title: row.title,
    summary: row.summary,
    source: row.source,
    url: row.url ?? undefined,
    imageUrl: row.image_url ?? undefined,
    publishedAt: row.published_at ?? undefined,
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
