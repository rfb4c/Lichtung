import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from '../lib/config';
import { mapComment, type CommentRow } from '../lib/mappers';
import type { Comment } from '../types';
import CommentItem from './CommentItem';
import CommentInput from './CommentInput';
import styles from './CommentSection.module.css';

interface CommentSectionProps {
  reportId: string;
  onCommentCountChange: (reportId: string, delta: number) => void;
}

export default function CommentSection({ reportId, onCommentCountChange }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

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
