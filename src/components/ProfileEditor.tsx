import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import styles from './ProfileEditor.module.css';

interface ProfileEditorProps {
  onClose: () => void;
}

export default function ProfileEditor({ onClose }: ProfileEditorProps) {
  const { user, handleUpdateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [city, setCity] = useState(user?.city || '');
  const [profession, setProfession] = useState(user?.profession || '');
  const [interestsText, setInterestsText] = useState((user?.interests || []).join(', '));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const interests = interestsText
      .split(/[,，]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const err = await handleUpdateProfile({
      displayName: displayName || '匿名用户',
      city: city || undefined,
      profession: profession || undefined,
      interests,
    });

    if (err) setError(err);
    else onClose();
    setSubmitting(false);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.card}>
        <div className={styles.header}>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} strokeWidth={1.75} />
          </button>
          <h2 className={styles.title}>编辑个人资料</h2>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}

          <label className={styles.field}>
            <span className={styles.fieldLabel}>昵称</span>
            <input
              className={styles.input}
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>城市</span>
            <input
              className={styles.input}
              type="text"
              placeholder="如：北京"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>职业</span>
            <input
              className={styles.input}
              type="text"
              placeholder="如：工程师"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>兴趣标签</span>
            <input
              className={styles.input}
              type="text"
              placeholder="用逗号分隔，如：科技, 教育, 环保"
              value={interestsText}
              onChange={(e) => setInterestsText(e.target.value)}
            />
          </label>

          <button className={styles.submitButton} type="submit" disabled={submitting}>
            {submitting ? '保存中...' : '保存'}
          </button>
        </form>
      </div>
    </div>
  );
}
