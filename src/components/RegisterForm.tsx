import { useState, type FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from './AuthModal.module.css';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const { handleRegister } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const err = await handleRegister(email, password, displayName || '匿名用户');
    if (err) setError(err);
    setSubmitting(false);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.title}>加入林间空地</h2>

      {error && <div className={styles.error}>{error}</div>}

      <input
        className={styles.input}
        type="text"
        placeholder="昵称"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        autoComplete="name"
      />
      <input
        className={styles.input}
        type="email"
        placeholder="邮箱"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />
      <input
        className={styles.input}
        type="password"
        placeholder="密码（至少6位）"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
        autoComplete="new-password"
      />

      <button className={styles.submitButton} type="submit" disabled={submitting}>
        {submitting ? '注册中...' : '注册'}
      </button>

      <p className={styles.switchText}>
        已有账号？
        <button type="button" className={styles.switchLink} onClick={onSwitchToLogin}>
          登录
        </button>
      </p>
    </form>
  );
}
