import { useState, useEffect, useMemo, type FormEvent } from 'react';
import type { IdentityTag, MockComment, Report, Topic } from '../types';
import { useAuth } from '../contexts/AuthContext';
import IdentityTagEditor from './IdentityTagEditor';
import styles from './UserProfilePage.module.css';

interface ProfilePageProps {
  onBack: () => void;
  onNavigateToReport?: (reportId: string) => void;
}

interface GuestProfile {
  displayName: string;
  avatarUrl?: string;
  identities: IdentityTag[];
}

interface CommentWithReport extends MockComment {
  report?: Report;
  topic?: Topic;
}

const STORAGE_KEY = 'lichtung_guest_profile';

// Load guest profile from localStorage
function loadGuestProfile(): GuestProfile {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load guest profile:', e);
  }

  return {
    displayName: 'Guest User',
    identities: [],
  };
}

// Save guest profile to localStorage
function saveGuestProfile(profile: GuestProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save guest profile:', e);
  }
}

export default function ProfilePage({ onBack, onNavigateToReport }: ProfilePageProps) {
  const { isAuthenticated, user, handleUpdateProfile } = useAuth();

  // Initialize profile based on auth state
  const [profile, setProfile] = useState<GuestProfile>(() => {
    if (isAuthenticated && user) {
      return {
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        identities: user.identities,
      };
    }
    return loadGuestProfile();
  });

  const [editing, setEditing] = useState(false);
  const [editedDisplayName, setEditedDisplayName] = useState(profile.displayName);
  const [editedIdentities, setEditedIdentities] = useState<IdentityTag[]>(profile.identities);
  const [expandedTagId, setExpandedTagId] = useState<string | null>(null);

  // Sync profile with user when auth state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      setProfile({
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        identities: user.identities,
      });
    }
  }, [isAuthenticated, user]);

  // Get user's comments (for now, return empty since we're a guest)
  // In Phase 3, this would fetch from Supabase based on user ID
  const userComments = useMemo((): CommentWithReport[] => {
    // TODO: In Phase 3, fetch real comments from Supabase
    return [];
  }, []);

  // Save to localStorage whenever profile changes
  useEffect(() => {
    saveGuestProfile(profile);
  }, [profile]);

  const handleStartEdit = () => {
    setEditedDisplayName(profile.displayName);
    setEditedIdentities([...profile.identities]);
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setEditing(false);
  };

  const handleSaveEdit = async (e: FormEvent) => {
    e.preventDefault();

    const updated: GuestProfile = {
      displayName: editedDisplayName.trim() || 'Guest User',
      avatarUrl: profile.avatarUrl,
      identities: editedIdentities,
    };

    if (isAuthenticated) {
      // Save to Supabase for authenticated users
      const error = await handleUpdateProfile({
        displayName: updated.displayName,
        identities: updated.identities,
      });

      if (error) {
        alert(`Failed to save: ${error}`);
        return;
      }
    } else {
      // Save to localStorage for guest users
      saveGuestProfile(updated);
    }

    setProfile(updated);
    setEditing(false);
  };

  const handleTagClick = (tag: IdentityTag) => {
    if (!tag.narrative) return;
    setExpandedTagId((prev) => (prev === tag.id ? null : tag.id));
  };

  const initial = profile.displayName.charAt(0) || 'G';

  return (
    <div className={styles.container}>
      {/* Header with back button */}
      <header className={styles.header}>
        <button
          className={styles.backButton}
          onClick={onBack}
          aria-label="Go back"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>
      </header>

      {editing ? (
        /* ========== Edit Mode ========== */
        <div className={styles.editMode}>
          <form onSubmit={handleSaveEdit} className={styles.editForm}>
            <h2 className={styles.editTitle}>Edit Your Profile</h2>

            {!isAuthenticated && (
              <div className={styles.guestNotice}>
                You're in guest mode. Changes are saved locally. <a href="#" onClick={(e) => { e.preventDefault(); /* TODO: trigger auth modal */ }}>Sign in</a> to save permanently.
              </div>
            )}

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Display Name</span>
              <input
                className={styles.input}
                type="text"
                value={editedDisplayName}
                onChange={(e) => setEditedDisplayName(e.target.value)}
                placeholder="Your name"
                required
              />
            </label>

            <div className={styles.divider} />

            <IdentityTagEditor
              selectedTags={editedIdentities}
              onChange={setEditedIdentities}
              maxTags={5}
            />

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
              <button type="submit" className={styles.saveButton}>
                Save Changes
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ========== View Mode ========== */
        <>
          {/* User Profile Section */}
          <section className={styles.profileSection}>
            <div className={styles.avatarLarge}>
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.displayName} className={styles.avatarImage} />
              ) : (
                <span className={styles.avatarInitial}>{initial}</span>
              )}
            </div>

            <h1 className={styles.displayName}>{profile.displayName}</h1>

            <button className={styles.editProfileButton} onClick={handleStartEdit}>
              Edit Profile
            </button>

            {/* Identity Tags */}
            {profile.identities && profile.identities.length > 0 && (
              <div className={styles.identitySection}>
                <div className={styles.chipGrid}>
                  {profile.identities.map((tag) => {
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

            {profile.identities.length === 0 && (
              <p className={styles.emptyHint}>
                Add identity tags to help others understand your perspective
              </p>
            )}
          </section>

          {/* Comments History */}
          <section className={styles.commentsSection}>
            <h2 className={styles.sectionTitle}>
              Comments ({userComments.length})
            </h2>

            {userComments.length === 0 ? (
              <div className={styles.emptyState}>
                No comments yet. Share your thoughts on reports in the feed!
              </div>
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
        </>
      )}
    </div>
  );
}

/* ── Comment History Item ── */

interface CommentHistoryItemProps {
  comment: CommentWithReport;
  onNavigateToReport?: (reportId: string) => void;
}

function CommentHistoryItem({ comment, onNavigateToReport }: CommentHistoryItemProps) {
  const timeLabel = formatTime(comment.createdAt);

  return (
    <article className={styles.commentItem}>
      <p className={styles.commentContent}>{comment.content}</p>

      <div className={styles.commentMeta}>
        <span className={styles.commentTime}>{timeLabel}</span>

        {comment.report && onNavigateToReport && (
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
