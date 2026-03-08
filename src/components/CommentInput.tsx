import { useState, type FormEvent } from 'react';
import { Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { mapComment, type CommentRow } from '../lib/mappers';
import type { Comment } from '../types';
import styles from './CommentInput.module.css';

interface CommentInputProps {
  reportId: string;
  onCommentAdded: (comment: Comment) => void;
}

export default function CommentInput({ reportId, onCommentAdded }: CommentInputProps) {
  const { user, isAuthenticated, isConfigured, showAuth } = useAuth();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!isConfigured) {
    return (
      <div className={styles.demoNotice}>Demo mode - commenting disabled</div>
    );
  }

  if (!isAuthenticated) {
    return (
      <button className={styles.loginPrompt} onClick={() => showAuth('login')}>
        Log in to comment
      </button>
    );
  }

  const initial = user?.displayName?.charAt(0) || '?';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || submitting || !user) return;

    setSubmitError(null);
    setSubmitting(true);
    const { data, error } = await supabase
      .from('comments')
      .insert({ report_id: reportId, user_id: user.id, content: trimmed })
      .select('*, profiles(*)')
      .single();

    if (error) {
      const isFkError = error.message.toLowerCase().includes('foreign key') ||
        error.message.toLowerCase().includes('violates');
      setSubmitError(isFkError
        ? 'Failed: Report data not synced to database yet'
        : `Failed: ${error.message}`
      );
    } else if (data) {
      onCommentAdded(mapComment(data as CommentRow));
      setContent('');
    }
    setSubmitting(false);
  };

  return (
    <div>
      <form className={styles.inputRow} onSubmit={handleSubmit}>
        <div className={styles.avatar}>
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.displayName} className={styles.avatarImage} />
          ) : (
            initial
          )}
        </div>
        <input
          className={styles.input}
          type="text"
          placeholder="Post your comment..."
          value={content}
          onChange={(e) => { setContent(e.target.value); setSubmitError(null); }}
          maxLength={500}
          disabled={submitting}
        />
        <button
          className={styles.sendButton}
          type="submit"
          disabled={!content.trim() || submitting}
        >
          <Send size={18} strokeWidth={1.75} />
        </button>
      </form>
      {submitError && <p className={styles.submitError}>{submitError}</p>}
    </div>
  );
}
