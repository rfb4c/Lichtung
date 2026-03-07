import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  Link,
  MessageCircle,
  Repeat2,
  Heart,
  BarChart2,
  Bookmark,
  Share,
} from 'lucide-react';
import { Report, Event, Stance } from '../types';
import DistributionTooltip from './DistributionTooltip';
import CommentSection from './CommentSection';
import styles from './FeedItem.module.css';
import mediaSources from '../data/media-sources.json';

interface FeedItemProps {
  report: Report;
  event?: Event;
  commentCount?: number;
  onCommentCountChange?: (reportId: string, delta: number) => void;
}

const stanceLabels: Record<Stance, string> = {
  supportive: 'Supportive',
  neutral: 'Neutral',
  opposed: 'Opposed',
};

export default function FeedItem({ report, event, commentCount, onCommentCountChange }: FeedItemProps) {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipMounted, setTooltipMounted] = useState(false);
  const [commentsExpanded, setCommentsExpanded] = useState(false);
  const showTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const unmountTimerRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (showTimerRef.current) clearTimeout(showTimerRef.current);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (unmountTimerRef.current) clearTimeout(unmountTimerRef.current);
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const handleMouseEnter = useCallback(() => {
    clearTimers();
    showTimerRef.current = window.setTimeout(() => {
      setTooltipMounted(true);
      requestAnimationFrame(() => setTooltipVisible(true));
    }, 500);
  }, [clearTimers]);

  const handleMouseLeave = useCallback(() => {
    clearTimers();
    hideTimerRef.current = window.setTimeout(() => {
      setTooltipVisible(false);
      unmountTimerRef.current = window.setTimeout(() => setTooltipMounted(false), 300);
    }, 100);
  }, [clearTimers]);

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
    setCommentsExpanded((prev) => !prev);
  }, []);

  const handleCommentCountChange = useCallback((reportId: string, delta: number) => {
    onCommentCountChange?.(reportId, delta);
  }, [onCommentCountChange]);

  return (
    <article
      className={styles.feedItem}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
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

        <div className={styles.tweetText}>
          <span className={`${styles.stanceTag} ${styles[report.stance]}`}>
            [{stanceLabels[report.stance]}]
          </span>{' '}
          {report.summary.slice(0, 50)}...
        </div>

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

        <div className={styles.actions}>
          <button
            className={`${styles.actionButton} ${commentsExpanded ? styles.actionActive : ''}`}
            onClick={handleToggleComments}
          >
            <MessageCircle size={16} strokeWidth={1.75} />
            <span className={styles.actionCount}>{actionCounts.comments}</span>
          </button>
          <button className={styles.actionButton}>
            <Repeat2 size={16} strokeWidth={1.75} />
            <span className={styles.actionCount}>{actionCounts.retweets}</span>
          </button>
          <button className={styles.actionButton}>
            <Heart size={16} strokeWidth={1.75} />
            <span className={styles.actionCount}>{actionCounts.likes}</span>
          </button>
          <button className={styles.actionButton}>
            <BarChart2 size={16} strokeWidth={1.75} />
            <span className={styles.actionCount}>{actionCounts.views.toFixed(1)}K</span>
          </button>
          <button className={styles.actionButton}>
            <Bookmark size={16} strokeWidth={1.75} />
          </button>
          <button className={styles.actionButton}>
            <Share size={16} strokeWidth={1.75} />
          </button>
        </div>

        {commentsExpanded && (
          <CommentSection
            reportId={report.id}
            onCommentCountChange={handleCommentCountChange}
          />
        )}
      </div>

      {event && tooltipMounted && (
        <div
          className={`${styles.tooltipWrapper} ${tooltipVisible ? styles.tooltipVisible : styles.tooltipHidden}`}
          onMouseEnter={() => clearTimers()}
          onMouseLeave={handleMouseLeave}
        >
          <DistributionTooltip
            event={event}
            currentStance={report.stance}
            visible={true}
          />
        </div>
      )}
    </article>
  );
}
