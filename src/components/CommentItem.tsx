import type { Comment } from '../types';
import styles from './CommentItem.module.css';

interface CommentItemProps {
  comment: Comment;
}

export default function CommentItem({ comment }: CommentItemProps) {
  const profile = comment.profile;
  const initial = profile?.displayName?.charAt(0) || '?';

  const identityParts: string[] = [];
  if (profile?.city) identityParts.push(profile.city);
  if (profile?.profession) identityParts.push(profile.profession);

  const timeLabel = formatTime(comment.createdAt);

  return (
    <div className={styles.commentItem}>
      <div className={styles.avatar}>{initial}</div>
      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.displayName}>{profile?.displayName || '匿名用户'}</span>
          {identityParts.length > 0 && (
            <span className={styles.identity}>{identityParts.join(' · ')}</span>
          )}
          <span className={styles.dot}>·</span>
          <span className={styles.time}>{timeLabel}</span>
        </div>
        <p className={styles.text}>{comment.content}</p>
      </div>
    </div>
  );
}

function formatTime(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return '刚刚';
  if (diffMin < 60) return `${diffMin}分钟前`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}小时前`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay}天前`;
  return new Date(isoString).toLocaleDateString('zh-CN');
}
