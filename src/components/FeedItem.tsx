import { useState, useRef, useCallback, useEffect } from 'react';
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

const mediaAvatars: Record<string, string> = {
  国内: '🇨🇳',
  外媒: '🌐',
};

export default function FeedItem({ report, event }: FeedItemProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const showTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (showTimerRef.current) clearTimeout(showTimerRef.current);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const handleMouseEnter = useCallback(() => {
    clearTimers();
    showTimerRef.current = window.setTimeout(() => setShowTooltip(true), 500);
  }, [clearTimers]);

  const handleMouseLeave = useCallback(() => {
    clearTimers();
    hideTimerRef.current = window.setTimeout(() => setShowTooltip(false), 300);
  }, [clearTimers]);

  const mediaName = report.source === '外媒' ? 'Global News' : '新闻媒体';
  const mediaHandle = report.source === '外媒' ? '@globalnews' : '@xinwenmeiti';

  return (
    <article
      className={styles.feedItem}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.avatarColumn}>
        <div className={styles.avatar}>{mediaAvatars[report.source]}</div>
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
          <div className={styles.linkDomain}>
            🔗 {report.source === '外媒' ? 'news.com' : 'news.cn'}
          </div>
          <div className={styles.linkTitle}>{report.title}</div>
          <div className={styles.linkDescription}>{report.summary}</div>
        </div>

        <div className={styles.actions}>
          <button className={styles.actionButton}>
            <span>💬</span>
            <span className={styles.actionCount}>
              {Math.floor(Math.random() * 100)}
            </span>
          </button>
          <button className={styles.actionButton}>
            <span>🔁</span>
            <span className={styles.actionCount}>
              {Math.floor(Math.random() * 50)}
            </span>
          </button>
          <button className={styles.actionButton}>
            <span>❤️</span>
            <span className={styles.actionCount}>
              {Math.floor(Math.random() * 500)}
            </span>
          </button>
          <button className={styles.actionButton}>
            <span>📊</span>
            <span className={styles.actionCount}>
              {(Math.random() * 10).toFixed(1)}万
            </span>
          </button>
          <button className={styles.actionButton}>
            <span>🔖</span>
          </button>
          <button className={styles.actionButton}>
            <span>↗️</span>
          </button>
        </div>
      </div>

      {event && showTooltip && (
        <div
          className={styles.tooltipWrapper}
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
