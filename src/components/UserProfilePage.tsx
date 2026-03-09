import { useState, useEffect } from 'react';
import type { MockComment, Report, Topic, IdentityTag } from '../types';
import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from '../lib/config';
import styles from './UserProfilePage.module.css';
import staticData from '../data/app-data.json';

interface UserProfilePageProps {
  userId: string;
  onNavigateBack: () => void;
  onNavigateToReport: (reportId: string) => void;
}

interface CommentWithReport extends MockComment {
  report?: Report;
  topic?: Topic;
}

export default function UserProfilePage({ userId, onNavigateBack, onNavigateToReport }: UserProfilePageProps) {
  const [expandedTagId, setExpandedTagId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data from Supabase or fallback to static JSON
  useEffect(() => {
    async function fetchUser() {
      setLoading(true);

      if (!isSupabaseConfigured) {
        // Fallback to static JSON
        const foundUser = staticData.mockUsers?.find((u) => u.id === userId);
        setUser(foundUser ? {
          ...foundUser,
          identities: foundUser.identities.map((tag: any) => ({
            ...tag,
            layer: tag.layer as 1 | 2 | 3 | 4,
          })),
        } : null);
        setLoading(false);
        return;
      }

      // Try to fetch from Supabase
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        // Fallback to static JSON if Supabase fails
        const foundUser = staticData.mockUsers?.find((u) => u.id === userId);
        setUser(foundUser ? {
          ...foundUser,
          identities: foundUser.identities.map((tag: any) => ({
            ...tag,
            layer: tag.layer as 1 | 2 | 3 | 4,
          })),
        } : null);
      } else {
        // Map Supabase data to UserProfile
        setUser({
          id: data.id,
          displayName: data.display_name || 'Anonymous',
          avatarUrl: data.avatar_url,
          identities: (data.identities as IdentityTag[]) || [],
        });
      }

      setLoading(false);
    }

    fetchUser();
  }, [userId]);

  // Get user's comments with associated reports
  const [userComments, setUserComments] = useState<CommentWithReport[]>([]);

  useEffect(() => {
    async function fetchComments() {
      if (!user) return;

      if (!isSupabaseConfigured) {
        // Fallback to static JSON
        const comments = staticData.mockComments?.filter((c) => c.userId === userId) || [];
        const commentsWithData: CommentWithReport[] = comments.map((comment) => {
          const report = staticData.reports.find((r) => r.id === comment.reportId) as Report | undefined;
          const topic = report?.topicId
            ? (staticData.topics.find((t) => t.id === report.topicId) as Topic | undefined)
            : undefined;
          return { ...comment, report, topic };
        });
        setUserComments(commentsWithData.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
        return;
      }

      // Fetch from Supabase
      const { data: commentsData } = await supabase
        .from('comments')
        .select('id, report_id, user_id, content, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!commentsData || commentsData.length === 0) {
        setUserComments([]);
        return;
      }

      // Fetch reports and topics
      const reportIds = [...new Set(commentsData.map(c => c.report_id))];
      const { data: reportsData } = await supabase
        .from('reports')
        .select('id, title, summary, source, topic_id, image_url, published_at')
        .in('id', reportIds);

      const topicIds = reportsData
        ? [...new Set(reportsData.map(r => r.topic_id).filter(Boolean))]
        : [];
      const { data: topicsData } = await supabase
        .from('topics')
        .select('id, name, scope, tag_keywords')
        .in('id', topicIds);

      const reportsMap = new Map((reportsData || []).map(r => [r.id, r]));
      const topicsMap = new Map((topicsData || []).map(t => [t.id, t]));

      const commentsWithReports: CommentWithReport[] = commentsData.map((row: any) => {
        const reportData = reportsMap.get(row.report_id);
        const topicData = reportData?.topic_id ? topicsMap.get(reportData.topic_id) : undefined;

        return {
          id: row.id,
          reportId: row.report_id,
          userId: row.user_id,
          content: row.content,
          createdAt: row.created_at,
          report: reportData ? {
            id: reportData.id,
            title: reportData.title,
            summary: reportData.summary,
            source: reportData.source,
            topicId: reportData.topic_id ?? undefined,
            imageUrl: reportData.image_url ?? undefined,
            publishedAt: reportData.published_at ?? undefined,
          } : undefined,
          topic: topicData ? {
            id: topicData.id,
            name: topicData.name,
            scope: topicData.scope,
            tagKeywords: topicData.tag_keywords ?? [],
          } : undefined,
        };
      });

      setUserComments(commentsWithReports);
    }

    fetchComments();
  }, [user, userId]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <button
            className={styles.backButton}
            onClick={onNavigateBack}
            aria-label="Go back"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>Back</span>
          </button>
        </header>
        <div className={styles.error}>User not found</div>
      </div>
    );
  }

  const handleTagClick = (tag: IdentityTag) => {
    if (!tag.narrative) return;
    setExpandedTagId((prev) => (prev === tag.id ? null : tag.id));
  };

  return (
    <div className={styles.container}>
      {/* Header with back button */}
      <header className={styles.header}>
        <button
          className={styles.backButton}
          onClick={onNavigateBack}
          aria-label="Go back"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>
      </header>

      {/* User Profile Section */}
      <section className={styles.profileSection}>
        <div className={styles.avatarLarge}>
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.displayName} className={styles.avatarImage} />
          ) : (
            <span className={styles.avatarInitial}>{user.displayName.charAt(0)}</span>
          )}
        </div>

        <h1 className={styles.displayName}>{user.displayName}</h1>

        {/* Identity Tags */}
        {user.identities && user.identities.length > 0 && (
          <div className={styles.identitySection}>
            <div className={styles.chipGrid}>
              {user.identities.map((tag: IdentityTag) => {
                const hasNarrative = !!tag.narrative;
                const isExpanded = expandedTagId === tag.id;
                return (
                  <div key={tag.id}>
                    <button
                      className={`${styles.chip} ${hasNarrative ? styles.chipClickable : ''} ${isExpanded ? styles.chipActive : ''}`}
                      onClick={() => handleTagClick(tag)}
                      type="button"
                      aria-expanded={hasNarrative ? isExpanded : undefined}
                    >
                      {tag.emoji && <span className={styles.chipEmoji}>{tag.emoji}</span>}
                      <span className={styles.chipLabel}>{tag.label}</span>
                      {hasNarrative && <span className={styles.narrativeDot}>•</span>}
                    </button>

                    {/* Expanded narrative */}
                    {isExpanded && tag.narrative && (
                      <div className={styles.narrativePanel}>
                        <p className={styles.narrativeText}>"{tag.narrative}"</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Comments History */}
      <section className={styles.commentsSection}>
        <h2 className={styles.sectionTitle}>
          Comments ({userComments.length})
        </h2>

        {userComments.length === 0 ? (
          <div className={styles.emptyState}>No comments yet</div>
        ) : (
          <div className={styles.commentsList}>
            {userComments.map((comment) => (
              <CommentHistoryItem
                key={comment.id}
                comment={comment}
                onNavigateToReport={onNavigateToReport}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ── Comment History Item ── */

interface CommentHistoryItemProps {
  comment: CommentWithReport;
  onNavigateToReport: (reportId: string) => void;
}

function CommentHistoryItem({ comment, onNavigateToReport }: CommentHistoryItemProps) {
  const timeLabel = formatTime(comment.createdAt);

  return (
    <article className={styles.commentItem}>
      {/* Comment content */}
      <p className={styles.commentContent}>{comment.content}</p>

      {/* Metadata */}
      <div className={styles.commentMeta}>
        <span className={styles.commentTime}>{timeLabel}</span>

        {comment.report && (
          <>
            <span className={styles.metaDivider}>·</span>
            <span className={styles.commentContext}>on</span>
            <button
              className={styles.reportLink}
              onClick={() => onNavigateToReport(comment.reportId)}
              type="button"
            >
              {comment.report.title}
            </button>

            {/* Topic tag */}
            {comment.topic && (
              <span className={styles.topicTag}>
                {comment.topic.name}
              </span>
            )}
          </>
        )}
      </div>
    </article>
  );
}

/* ── Time formatting ── */

function formatTime(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay}d ago`;

  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
