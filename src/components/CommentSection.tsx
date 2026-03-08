import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from '../lib/config';
import { mapComment, type CommentRow } from '../lib/mappers';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import type { Comment, PollingData, MockUser, MockComment } from '../types';
import CommentItem from './CommentItem';
import CommentInput from './CommentInput';
import DistributionChart from './DistributionChart';
import styles from './CommentSection.module.css';
import appData from '../data/app-data.json';

interface CommentSectionProps {
  reportId: string;
  topicId?: string;
  subtopicId?: string;
  onCommentCountChange: (reportId: string, delta: number) => void;
  onUserClick?: (userId: string) => void;
}

/**
 * Build mock comments with embedded user profiles (including identity tags)
 * for the static demo when Supabase is not configured.
 */
function buildMockComments(reportId: string): Comment[] {
  const mockUsers = (appData.mockUsers ?? []) as MockUser[];
  const mockComments = (appData.mockComments ?? []) as MockComment[];
  const userMap = new Map(mockUsers.map((u) => [u.id, u]));

  return mockComments
    .filter((mc) => mc.reportId === reportId)
    .map((mc) => {
      const user = userMap.get(mc.userId);
      return {
        id: mc.id,
        reportId: mc.reportId,
        userId: mc.userId,
        content: mc.content,
        createdAt: mc.createdAt,
        profile: user
          ? {
            id: user.id,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
            interests: [],
            identities: user.identities,
          }
          : undefined,
      };
    });
}

export default function CommentSection({ reportId, topicId, subtopicId, onCommentCountChange, onUserClick }: CommentSectionProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [pollingData, setPollingData] = useState<PollingData | null>(null);

  // Load polling data from static JSON
  // Priority: subtopicId > topicId
  useEffect(() => {
    if (subtopicId) {
      // Prefer subtopic polling data (most specific)
      const data = appData.pollingData.find((p) => p.subtopicId === subtopicId);
      setPollingData(data || null);
    } else if (topicId) {
      // Fallback: find any polling data for this topic
      const data = appData.pollingData.find((p) => p.topicId === topicId);
      setPollingData(data || null);
    }
  }, [topicId, subtopicId]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Load mock comments from static JSON for demo
      const mockComments = buildMockComments(reportId);
      setComments(mockComments);
      setLoading(false);
      return;
    }

    async function fetchComments() {
      const { data, error } = await supabase
        .from('comments')
        .select('*, profiles(*)')
        .eq('report_id', reportId)
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        setComments((data as CommentRow[]).map(mapComment));
      } else {
        // Fallback to mock comments when Supabase has no data
        const mockComments = buildMockComments(reportId);
        setComments(mockComments);
      }
      setLoading(false);
    }

    fetchComments();
  }, [reportId]);

  const handleCommentAdded = (comment: Comment) => {
    setComments((prev) => [...prev, comment]);
    onCommentCountChange(reportId, 1);
  };

  const handleCommentDeleted = async (commentId: string) => {
    if (!isSupabaseConfigured) {
      showToast('Comment deletion is only available when logged in', 'warning');
      return;
    }

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      showToast(`Failed to delete comment: ${error.message}`, 'error');
      return;
    }

    // Update local state
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    onCommentCountChange(reportId, -1);
    showToast('Comment deleted successfully', 'success', 2000);
  };

  return (
    <div className={styles.commentSection}>
      {/* Pinned chart at top */}
      {pollingData && (
        <div className={styles.chartPinned}>
          <DistributionChart pollingData={pollingData} />
        </div>
      )}

      {/* Comments list */}
      {loading ? (
        <div className={styles.loading}>Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className={styles.empty}>No comments yet</div>
      ) : (
        <div className={styles.list}>
          {comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              onAvatarClick={onUserClick}
              currentUserId={user?.id}
              onDelete={handleCommentDeleted}
            />
          ))}
        </div>
      )}
      <CommentInput reportId={reportId} onCommentAdded={handleCommentAdded} />
    </div>
  );
}
