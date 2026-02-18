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
      <div className={styles.demoNotice}>演示模式，无法评论</div>
    );
  }

  if (!isAuthenticated) {
    return (
      <button className={styles.loginPrompt} onClick={() => showAuth('login')}>
        登录后发表评论
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
        ? '发送失败：当前报道数据尚未同步到数据库，暂不支持评论'
        : `发送失败：${error.message}`
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
        <div className={styles.avatar}>{initial}</div>
        <input
          className={styles.input}
          type="text"
          placeholder="发表评论..."
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
