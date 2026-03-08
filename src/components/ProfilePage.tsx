import { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from 'react';
import { Upload, X } from 'lucide-react';
import type { IdentityTag, MockComment, Report, Topic } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from '../lib/config';
import IdentityTagEditor from './IdentityTagEditor';
import styles from './UserProfilePage.module.css';
import appData from '../data/app-data.json';

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
  const { showToast } = useToast();

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
  const [editedAvatarUrl, setEditedAvatarUrl] = useState<string | undefined>(profile.avatarUrl);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [expandedTagId, setExpandedTagId] = useState<string | null>(null);
  const [userComments, setUserComments] = useState<CommentWithReport[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Fetch user's comments from Supabase
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setUserComments([]);
      return;
    }

    async function fetchUserComments() {
      if (!user) return; // Guard against null user

      if (!isSupabaseConfigured) {
        // Fallback to mock data from JSON
        const mockComments = (appData.mockComments ?? []) as MockComment[];
        const mockUsers = (appData.mockUsers ?? []) as any[];
        const reports = (appData.reports ?? []) as Report[];
        const topics = (appData.topics ?? []) as Topic[];

        // Find the mock user ID for the current authenticated user
        const currentMockUser = mockUsers.find(u => u.displayName === user.displayName);
        if (!currentMockUser) {
          setUserComments([]);
          return;
        }

        const userMockComments = mockComments
          .filter(mc => mc.userId === currentMockUser.id)
          .map(mc => {
            const report = reports.find(r => r.id === mc.reportId);
            const topic = report?.topicId ? topics.find(t => t.id === report.topicId) : undefined;
            return {
              ...mc,
              report,
              topic,
            };
          });

        setUserComments(userMockComments);
        return;
      }

      // Fetch from Supabase with joined reports and topics
      // Note: Using manual JOIN instead of Supabase's automatic joins for better control
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          report_id,
          user_id,
          content,
          created_at
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user comments:', error);
        setUserComments([]);
        return;
      }

      if (!data || data.length === 0) {
        setUserComments([]);
        return;
      }

      // Fetch all unique report IDs
      const reportIds = [...new Set(data.map((c: any) => c.report_id))];

      // Fetch reports with topics
      const { data: reportsData, error: reportsError } = await supabase
        .from('reports')
        .select('id, title, summary, source, topic_id, image_url, published_at')
        .in('id', reportIds);

      if (reportsError) {
        console.error('Error fetching reports:', reportsError);
      }

      // Fetch all unique topic IDs
      const topicIds = reportsData
        ? [...new Set(reportsData.map((r: any) => r.topic_id).filter(Boolean))]
        : [];

      const { data: topicsData, error: topicsError } = await supabase
        .from('topics')
        .select('id, name, scope, tag_keywords')
        .in('id', topicIds);

      if (topicsError) {
        console.error('Error fetching topics:', topicsError);
      }

      // Create lookup maps
      const reportsMap = new Map(
        (reportsData || []).map((r: any) => [r.id, r])
      );
      const topicsMap = new Map(
        (topicsData || []).map((t: any) => [t.id, t])
      );

      // Map comments with their reports and topics
      const commentsWithReports: CommentWithReport[] = data.map((row: any) => {
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

      console.log('[ProfilePage] Fetched comments:', {
        totalComments: commentsWithReports.length,
        commentsWithReports: commentsWithReports.length,
        sample: commentsWithReports[0],
      });

      setUserComments(commentsWithReports);
    }

    fetchUserComments();
  }, [isAuthenticated, user]);

  // Save to localStorage whenever profile changes
  useEffect(() => {
    saveGuestProfile(profile);
  }, [profile]);

  const handleStartEdit = () => {
    setEditedDisplayName(profile.displayName);
    setEditedIdentities([...profile.identities]);
    setEditedAvatarUrl(profile.avatarUrl);
    setAvatarFile(null);
    setAvatarPreview(null);
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleAvatarFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'warning');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showToast('Image size must be less than 2MB', 'warning');
      return;
    }

    setAvatarFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setEditedAvatarUrl(undefined);
  };

  const uploadAvatarToSupabase = async (file: File, userId: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSaveEdit = async (e: FormEvent) => {
    e.preventDefault();

    let finalAvatarUrl = editedAvatarUrl;

    // Upload avatar if file is selected and user is authenticated
    if (avatarFile && isAuthenticated && user) {
      setUploadingAvatar(true);
      const uploadedUrl = await uploadAvatarToSupabase(avatarFile, user.id);
      setUploadingAvatar(false);

      if (!uploadedUrl) {
        showToast('Failed to upload avatar. Please try again.', 'error');
        return;
      }

      finalAvatarUrl = uploadedUrl;
    }

    const updated: GuestProfile = {
      displayName: editedDisplayName.trim() || 'Guest User',
      avatarUrl: finalAvatarUrl,
      identities: editedIdentities,
    };

    if (isAuthenticated) {
      // Save to Supabase for authenticated users
      const error = await handleUpdateProfile({
        displayName: updated.displayName,
        avatarUrl: updated.avatarUrl,
        identities: updated.identities,
      });

      if (error) {
        showToast(`Failed to save: ${error}`, 'error');
        return;
      }
      showToast('Profile updated successfully', 'success', 2000);
    } else {
      // Save to localStorage for guest users (avatar file won't be uploaded)
      if (avatarFile) {
        showToast('Avatar upload is only available for logged-in users. Please sign in to upload an avatar.', 'warning');
        return;
      }
      saveGuestProfile(updated);
      showToast('Profile saved locally', 'success', 2000);
    }

    setProfile(updated);
    setAvatarFile(null);
    setAvatarPreview(null);
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

            {/* Avatar Upload */}
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Profile Picture</span>
              <div className={styles.avatarUpload}>
                <div className={styles.avatarPreviewContainer}>
                  {avatarPreview || editedAvatarUrl ? (
                    <img
                      src={avatarPreview || editedAvatarUrl}
                      alt="Avatar preview"
                      className={styles.avatarPreviewImage}
                    />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      <span className={styles.avatarInitialLarge}>
                        {editedDisplayName.charAt(0) || 'G'}
                      </span>
                    </div>
                  )}
                </div>
                <div className={styles.avatarActions}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    className={styles.fileInput}
                  />
                  <button
                    type="button"
                    className={styles.uploadButton}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!isAuthenticated}
                  >
                    <Upload size={16} />
                    <span>Upload Image</span>
                  </button>
                  {(avatarPreview || editedAvatarUrl) && (
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={handleRemoveAvatar}
                    >
                      <X size={16} />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
                {!isAuthenticated && (
                  <p className={styles.helperText}>
                    Sign in to upload a custom avatar
                  </p>
                )}
              </div>
            </div>

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
              <button type="submit" className={styles.saveButton} disabled={uploadingAvatar}>
                {uploadingAvatar ? 'Uploading...' : 'Save Changes'}
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

  console.log('[CommentHistoryItem] Rendering:', {
    hasReport: !!comment.report,
    hasNavigateHandler: !!onNavigateToReport,
    reportTitle: comment.report?.title,
    topicName: comment.topic?.name,
  });

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
