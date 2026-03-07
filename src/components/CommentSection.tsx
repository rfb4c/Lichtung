import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from '../lib/config';
import { mapComment, type CommentRow } from '../lib/mappers';
import type { Comment, PollingData } from '../types';
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
}

export default function CommentSection({ reportId, topicId, subtopicId, onCommentCountChange }: CommentSectionProps) {
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
      setLoading(false);
      return;
    }

    async function fetchComments() {
      const { data, error } = await supabase
        .from('comments')
        .select('*, profiles(*)')
        .eq('report_id', reportId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setComments((data as CommentRow[]).map(mapComment));
      }
      setLoading(false);
    }

    fetchComments();
  }, [reportId]);

  const handleCommentAdded = (comment: Comment) => {
    setComments((prev) => [...prev, comment]);
    onCommentCountChange(reportId, 1);
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
            <CommentItem key={c.id} comment={c} />
          ))}
        </div>
      )}
      <CommentInput reportId={reportId} onCommentAdded={handleCommentAdded} />
    </div>
  );
}
