import type { Event, Report, Stance, UserProfile, Comment } from '../types';

// Supabase 行类型（snake_case）

export interface EventRow {
  id: string;
  title: string;
  supportive: number;
  neutral: number;
  opposed: number;
}

export interface ReportRow {
  id: string;
  event_id: string;
  title: string;
  summary: string;
  source: string;
  stance: string;
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
}

export interface CommentRow {
  id: string;
  report_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: ProfileRow;
}

// 映射函数

export function mapEvent(row: EventRow): Event {
  return {
    id: row.id,
    title: row.title,
    distribution: {
      supportive: row.supportive,
      neutral: row.neutral,
      opposed: row.opposed,
    },
  };
}

export function mapReport(row: ReportRow): Report {
  return {
    id: row.id,
    eventId: row.event_id,
    title: row.title,
    summary: row.summary,
    source: row.source as Report['source'],
    stance: row.stance as Stance,
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
