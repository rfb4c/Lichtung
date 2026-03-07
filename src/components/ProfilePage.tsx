import { useState, useEffect, type FormEvent } from 'react';
import { ArrowLeft, MapPin, Briefcase, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from '../lib/config';
import styles from './ProfilePage.module.css';

interface ProfilePageProps {
  onBack: () => void;
}

interface MyComment {
  id: string;
  content: string;
  createdAt: string;
  reportId: string;
  reportTitle: string | null;
}

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

export default function ProfilePage({ onBack }: ProfilePageProps) {
  const { user, isAuthenticated, session, showAuth, handleUpdateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [city, setCity] = useState(user?.city || '');
  const [profession, setProfession] = useState(user?.profession || '');
  const [interestsText, setInterestsText] = useState((user?.interests || []).join(', '));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [myComments, setMyComments] = useState<MyComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !session?.user) return;

    setCommentsLoading(true);
    supabase
      .from('comments')
      .select('id, content, created_at, report_id, reports(title)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setMyComments((data as any[]).map((row) => ({
            id: row.id as string,
            content: row.content as string,
            createdAt: row.created_at as string,
            reportId: row.report_id as string,
            reportTitle: (row.reports?.title as string) ?? null,
          })));
        }
        setCommentsLoading(false);
      });
  }, [session]);

  if (!isAuthenticated || !user) {
    return (
      <>
        <header className={styles.header}>
          <button className={styles.backButton} onClick={onBack}>
            <ArrowLeft size={20} strokeWidth={1.75} />
          </button>
          <span className={styles.headerTitle}>Profile</span>
        </header>
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>Log in to view your profile</p>
          <button className={styles.loginButton} onClick={() => showAuth('login')}>
            Log in
          </button>
        </div>
      </>
    );
  }

  const initial = user.displayName?.charAt(0) || '?';
  const handle = `@${user.displayName?.toLowerCase().replace(/\s+/g, '') || 'user'}`;

  const handleStartEdit = () => {
    setDisplayName(user.displayName || '');
    setCity(user.city || '');
    setProfession(user.profession || '');
    setInterestsText((user.interests || []).join(', '));
    setError(null);
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const interests = interestsText
      .split(/[,，]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const err = await handleUpdateProfile({
      displayName: displayName || 'Anonymous',
      city: city || undefined,
      profession: profession || undefined,
      interests,
    });

    if (err) {
      setError(err);
    } else {
      setEditing(false);
    }
    setSubmitting(false);
  };

  return (
    <>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={onBack}>
          <ArrowLeft size={20} strokeWidth={1.75} />
        </button>
        <div className={styles.headerInfo}>
          <span className={styles.headerTitle}>{user.displayName}</span>
          {myComments.length > 0 && (
            <span className={styles.headerSub}>{myComments.length} comment{myComments.length > 1 ? 's' : ''}</span>
          )}
        </div>
      </header>

      {/* Banner */}
      <div className={styles.banner} />

      {/* Avatar + Edit button row */}
      <div className={styles.avatarRow}>
        <div className={styles.avatarLarge}>{initial}</div>
        {!editing && (
          <button className={styles.editButton} onClick={handleStartEdit}>
            Edit profile
          </button>
        )}
      </div>

      {/* Profile info / edit form */}
      <div className={styles.content}>
        {editing ? (
          <form className={styles.form} onSubmit={handleSubmit}>
            {error && <div className={styles.error}>{error}</div>}

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Display name</span>
              <input
                className={styles.input}
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>City</span>
              <input
                className={styles.input}
                type="text"
                placeholder="e.g., New York"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Profession</span>
              <input
                className={styles.input}
                type="text"
                placeholder="e.g., Engineer"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Interests</span>
              <input
                className={styles.input}
                type="text"
                placeholder="Comma-separated, e.g., Tech, Education, Climate"
                value={interestsText}
                onChange={(e) => setInterestsText(e.target.value)}
              />
            </label>

            <div className={styles.formActions}>
              <button type="button" className={styles.cancelButton} onClick={handleCancelEdit}>
                Cancel
              </button>
              <button className={styles.saveButton} type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        ) : (
          <div className={styles.info}>
            <h2 className={styles.displayName}>{user.displayName}</h2>
            <span className={styles.handle}>{handle}</span>

            <div className={styles.meta}>
              {user.city && (
                <span className={styles.metaItem}>
                  <MapPin size={16} strokeWidth={1.75} />
                  {user.city}
                </span>
              )}
              {user.profession && (
                <span className={styles.metaItem}>
                  <Briefcase size={16} strokeWidth={1.75} />
                  {user.profession}
                </span>
              )}
            </div>

            {user.interests.length > 0 && (
              <div className={styles.interests}>
                {user.interests.map((tag) => (
                  <span key={tag} className={styles.interestTag}>{tag}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Divider */}
      {!editing && <div className={styles.divider} />}

      {/* My comments */}
      {!editing && (
        <section className={styles.commentsSection}>
          <div className={styles.commentsSectionHeader}>
            <MessageCircle size={16} strokeWidth={1.75} />
            <span>My comments</span>
          </div>

          {commentsLoading ? (
            <div className={styles.commentsLoading}>Loading...</div>
          ) : myComments.length === 0 ? (
            <div className={styles.commentsEmpty}>
              <p>No comments yet</p>
              <p className={styles.commentsEmptyHint}>Go back to the feed and share your thoughts on reports</p>
            </div>
          ) : (
            <ul className={styles.commentsList}>
              {myComments.map((c) => (
                <li key={c.id} className={styles.commentRow}>
                  {c.reportTitle && (
                    <p className={styles.commentContext}>
                      Commented on "{c.reportTitle}"
                    </p>
                  )}
                  <p className={styles.commentContent}>{c.content}</p>
                  <span className={styles.commentTime}>{formatTime(c.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </>
  );
}
