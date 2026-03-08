import { useState, useCallback, useMemo } from 'react';
import {
  Link,
  MessageCircle,
  Repeat2,
  Heart,
  BarChart2,
  Bookmark,
  Share,
  Eye,
} from 'lucide-react';
import { Report, Topic, PollingData } from '../types';
import CommentSection from './CommentSection';
import DistributionChart from './DistributionChart';
import styles from './FeedItem.module.css';
import mediaSources from '../data/media-sources.json';
import appData from '../data/app-data.json';

interface FeedItemProps {
  report: Report;
  topic?: Topic;
  commentCount?: number;
  onCommentCountChange?: (reportId: string, delta: number) => void;
  onUserClick?: (userId: string) => void;
  initialViewMode?: 'closed' | 'comments' | 'data-only';
}

export default function FeedItem({ report, topic, commentCount, onCommentCountChange, onUserClick, initialViewMode = 'closed' }: FeedItemProps) {
  const [viewMode, setViewMode] = useState<'closed' | 'comments' | 'data-only'>(initialViewMode);

  // Load polling data if topic exists
  // Priority: report.subtopicId > report.topicId > topic.id
  const pollingData = useMemo<PollingData | null>(() => {
    // First, try to find polling data by subtopicId (most specific)
    if (report.subtopicId) {
      const data = appData.pollingData.find((p) => p.subtopicId === report.subtopicId);
      if (data) return data;
    }

    // Fallback: try to find by topicId
    if (report.topicId) {
      const data = appData.pollingData.find((p) => p.topicId === report.topicId && !p.subtopicId);
      if (data) return data;
    }

    // Last fallback: use topic.id (for backwards compatibility)
    if (topic) {
      return appData.pollingData.find((p) => p.topicId === topic.id) || null;
    }

    return null;
  }, [report.subtopicId, report.topicId, topic]);

  // Get media info from configuration file
  const mediaInfo = mediaSources.mediaSources[report.source as keyof typeof mediaSources.mediaSources] || {
    name: report.source,
    handle: `@${report.source.toLowerCase().replace(/\s+/g, '')}`,
    domain: 'news.com',
    logoUrl: 'https://logo.clearbit.com/news.com'
  };

  const mediaName = mediaInfo.name;
  const mediaHandle = mediaInfo.handle;

  // 基于 report.id 生成稳定的伪随机数（fallback 模式用）
  const actionCounts = useMemo(() => {
    const hash = report.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return {
      comments: commentCount ?? (hash * 13) % 100,
      retweets: (hash * 7) % 50,
      likes: (hash * 23) % 500,
      views: ((hash * 17) % 100) / 10,
    };
  }, [report.id, commentCount]);

  const handleToggleComments = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setViewMode((prev) => prev === 'comments' ? 'closed' : 'comments');
  }, []);

  const handleToggleDataOnly = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setViewMode((prev) => prev === 'data-only' ? 'closed' : 'data-only');
  }, []);

  const handleCommentCountChange = useCallback((reportId: string, delta: number) => {
    onCommentCountChange?.(reportId, delta);
  }, [onCommentCountChange]);

  return (
    <article className={styles.feedItem}>
      <div className={styles.avatarColumn}>
        <div className={styles.avatar}>
          <img
            src={mediaInfo.logoUrl}
            alt={mediaInfo.name}
            className={styles.mediaLogo}
            onError={(e) => {
              // Fallback to first letter if logo fails to load
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          <div className={styles.mediaFallback} style={{ display: 'none' }}>
            {mediaInfo.name.charAt(0)}
          </div>
        </div>
      </div>

      <div className={styles.contentColumn}>
        <div className={styles.header}>
          <span className={styles.displayName}>{mediaName}</span>
          <span className={styles.handle}>{mediaHandle}</span>
          <span className={styles.dot}>·</span>
          <span className={styles.time}>{report.publishedAt || '1h'}</span>
          <button className={styles.moreButton}>···</button>
        </div>

        {/* Topic badge */}
        {topic && (
          <span className={styles.topicBadge}>
            {topic.name}
          </span>
        )}

        {report.url ? (
          <a
            href={report.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.linkCard}
            onClick={(e) => e.stopPropagation()}
          >
            {report.imageUrl && (
              <img
                className={styles.linkImage}
                src={report.imageUrl}
                alt={report.title}
                loading="lazy"
              />
            )}
            <div className={styles.linkDomain}>
              <Link size={14} strokeWidth={1.75} />
              <span>{mediaInfo.domain}</span>
            </div>
            <div className={styles.linkTitle}>{report.title}</div>
            <div className={styles.linkDescription}>{report.summary}</div>
          </a>
        ) : (
          <div className={styles.linkCard}>
            {report.imageUrl && (
              <img
                className={styles.linkImage}
                src={report.imageUrl}
                alt={report.title}
                loading="lazy"
              />
            )}
            <div className={styles.linkDomain}>
              <Link size={14} strokeWidth={1.75} />
              <span>{mediaInfo.domain}</span>
            </div>
            <div className={styles.linkTitle}>{report.title}</div>
            <div className={styles.linkDescription}>{report.summary}</div>
          </div>
        )}

        <div className={styles.actions}>
          <button
            className={`${styles.actionButton} ${viewMode === 'comments' ? styles.actionActive : ''}`}
            onClick={handleToggleComments}
            title="View comments"
          >
            <MessageCircle size={16} strokeWidth={1.75} />
            <span className={styles.actionCount}>{actionCounts.comments}</span>
          </button>
          {topic && pollingData && (
            <button
              className={`${styles.actionButton} ${viewMode === 'data-only' ? styles.actionActive : ''}`}
              onClick={handleToggleDataOnly}
              title="View public opinion data"
            >
              <BarChart2 size={16} strokeWidth={1.75} />
              <span className={styles.actionLabel}>Public Opinion</span>
            </button>
          )}
          <button className={styles.actionButton}>
            <Repeat2 size={16} strokeWidth={1.75} />
            <span className={styles.actionCount}>{actionCounts.retweets}</span>
          </button>
          <button className={styles.actionButton}>
            <Heart size={16} strokeWidth={1.75} />
            <span className={styles.actionCount}>{actionCounts.likes}</span>
          </button>
          <button className={styles.actionButton}>
            <Eye size={16} strokeWidth={1.75} />
            <span className={styles.actionCount}>{actionCounts.views.toFixed(1)}K</span>
          </button>
          <button className={styles.actionButton}>
            <Bookmark size={16} strokeWidth={1.75} />
          </button>
          <button className={styles.actionButton}>
            <Share size={16} strokeWidth={1.75} />
          </button>
        </div>

        {viewMode === 'comments' && (
          <CommentSection
            reportId={report.id}
            topicId={report.topicId}
            subtopicId={report.subtopicId}
            onCommentCountChange={handleCommentCountChange}
            onUserClick={onUserClick}
          />
        )}

        {viewMode === 'data-only' && pollingData && (
          <div className={styles.dataOnlySection}>
            <DistributionChart pollingData={pollingData} />
          </div>
        )}
      </div>
    </article>
  );
}
