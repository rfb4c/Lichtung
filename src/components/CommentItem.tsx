import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { Comment, IdentityTag } from '../types';
import { useToast } from '../contexts/ToastContext';
import styles from './CommentItem.module.css';

interface CommentItemProps {
  comment: Comment;
  onAvatarClick?: (userId: string) => void;
  currentUserId?: string;
  onDelete?: (commentId: string) => void;
}

export default function CommentItem({ comment, onAvatarClick, currentUserId, onDelete }: CommentItemProps) {
  const { showToast } = useToast();
  const profile = comment.profile;
  const initial = profile?.displayName?.charAt(0) || '?';
  const identities = profile?.identities;
  const timeLabel = formatTime(comment.createdAt);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwnComment = currentUserId && comment.userId === currentUserId;

  const handleAvatarClick = () => {
    if (onAvatarClick && comment.userId) {
      onAvatarClick(comment.userId);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    const confirmed = window.confirm('Are you sure you want to delete this comment?');
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await onDelete(comment.id);
    } catch (error) {
      console.error('Failed to delete comment:', error);
      showToast('Failed to delete comment. Please try again.', 'error');
      setIsDeleting(false);
    }
  };

  return (
    <div className={styles.commentItem}>
      <button
        className={styles.avatarButton}
        onClick={handleAvatarClick}
        aria-label={`View ${profile?.displayName || 'user'}'s profile`}
        type="button"
      >
        <div className={styles.avatar}>
          {profile?.avatarUrl ? (
            <img src={profile.avatarUrl} alt={profile.displayName} className={styles.avatarImage} />
          ) : (
            initial
          )}
        </div>
      </button>
      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.displayName}>{profile?.displayName || 'Anonymous'}</span>
          <span className={styles.dot}>·</span>
          <span className={styles.time}>{timeLabel}</span>
          {isOwnComment && onDelete && (
            <button
              className={styles.deleteButton}
              onClick={handleDelete}
              disabled={isDeleting}
              title="Delete comment"
              aria-label="Delete comment"
            >
              <Trash2 size={14} strokeWidth={1.75} />
            </button>
          )}
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
      {expandedId && (() => {
        const tag = identities.find((t) => t.id === expandedId);
        return tag ? <NarrativePanel tag={tag} /> : null;
      })()}
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
