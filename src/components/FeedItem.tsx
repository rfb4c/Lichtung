import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  Globe,
  Newspaper,
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
import styles from './FeedItem.module.css';

interface FeedItemProps {
  report: Report;
  event?: Event;
}

const stanceLabels: Record<Stance, string> = {
  supportive: '支持',
  neutral: '中立',
  opposed: '反对',
};

export default function FeedItem({ report, event }: FeedItemProps) {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipMounted, setTooltipMounted] = useState(false);
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

  const mediaName = report.source === '外媒' ? 'Global News' : '新闻媒体';
  const mediaHandle = report.source === '外媒' ? '@globalnews' : '@xinwenmeiti';

  // 基于 report.id 生成稳定的伪随机数
  const actionCounts = useMemo(() => {
    const hash = report.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return {
      comments: (hash * 13) % 100,
      retweets: (hash * 7) % 50,
      likes: (hash * 23) % 500,
      views: ((hash * 17) % 100) / 10,
    };
  }, [report.id]);

  return (
    <article
      className={styles.feedItem}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.avatarColumn}>
        <div className={styles.avatar}>
          {report.source === '外媒'
            ? <Globe size={20} strokeWidth={1.75} />
            : <Newspaper size={20} strokeWidth={1.75} />
          }
        </div>
      </div>

      <div className={styles.contentColumn}>
        <div className={styles.header}>
          <span className={styles.displayName}>{mediaName}</span>
          <span className={styles.handle}>{mediaHandle}</span>
          <span className={styles.dot}>·</span>
          <span className={styles.time}>{report.publishedAt || '1小时前'}</span>
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
            <span>{report.source === '外媒' ? 'news.com' : 'news.cn'}</span>
          </div>
          <div className={styles.linkTitle}>{report.title}</div>
          <div className={styles.linkDescription}>{report.summary}</div>
        </div>

        <div className={styles.actions}>
          <button className={styles.actionButton}>
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
            <span className={styles.actionCount}>{actionCounts.views.toFixed(1)}万</span>
          </button>
          <button className={styles.actionButton}>
            <Bookmark size={16} strokeWidth={1.75} />
          </button>
          <button className={styles.actionButton}>
            <Share size={16} strokeWidth={1.75} />
          </button>
        </div>
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
