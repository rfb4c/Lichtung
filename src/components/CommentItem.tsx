import { useState } from 'react';
import type { Comment, IdentityTag } from '../types';
import styles from './CommentItem.module.css';

interface CommentItemProps {
  comment: Comment;
}

export default function CommentItem({ comment }: CommentItemProps) {
  const profile = comment.profile;
  const initial = profile?.displayName?.charAt(0) || '?';
  const identities = profile?.identities;
  const timeLabel = formatTime(comment.createdAt);

  return (
    <div className={styles.commentItem}>
      <div className={styles.avatar}>
        {profile?.avatarUrl ? (
          <img src={profile.avatarUrl} alt={profile.displayName} className={styles.avatarImage} />
        ) : (
          initial
        )}
      </div>
      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.displayName}>{profile?.displayName || 'Anonymous'}</span>
          <span className={styles.dot}>·</span>
          <span className={styles.time}>{timeLabel}</span>
        </div>

        {/* Path C: Identity tag chips */}
        {identities && identities.length > 0 && (
          <IdentityChips identities={identities} />
        )}

        <p className={styles.text}>{comment.content}</p>
      </div>
    </div>
  );
}

/* ── Identity Chips Row ── */

function IdentityChips({ identities }: { identities: IdentityTag[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleChipClick = (tag: IdentityTag) => {
    if (!tag.narrative) return;
    setExpandedId((prev) => (prev === tag.id ? null : tag.id));
  };

  return (
    <div className={styles.identitySection}>
      <div className={styles.chipRow}>
        {identities.map((tag) => {
          const hasNarrative = !!tag.narrative;
          const isExpanded = expandedId === tag.id;
          return (
            <button
              key={tag.id}
              className={`${styles.chip} ${hasNarrative ? styles.chipClickable : ''} ${isExpanded ? styles.chipActive : ''}`}
              onClick={() => handleChipClick(tag)}
              type="button"
              aria-expanded={hasNarrative ? isExpanded : undefined}
            >
              {tag.emoji && <span className={styles.chipEmoji}>{tag.emoji}</span>}
              <span>{tag.label}</span>
              {hasNarrative && <span className={styles.narrativeDot}>•</span>}
            </button>
          );
        })}
      </div>

      {/* Narrative expansion */}
      {expandedId && (
        <NarrativePanel
          tag={identities.find((t) => t.id === expandedId)!}
        />
      )}
    </div>
  );
}

function NarrativePanel({ tag }: { tag: IdentityTag }) {
  if (!tag.narrative) return null;
  return (
    <div className={styles.narrativePanel}>
      <p className={styles.narrativeText}>"{tag.narrative}"</p>
    </div>
  );
}

/* ── Time formatting ── */

function formatTime(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay}d`;
  return new Date(isoString).toLocaleDateString('en-US');
}
