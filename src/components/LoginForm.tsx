import { useState, type FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from './AuthModal.module.css';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export default function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const { handleLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const err = await handleLogin(email, password);
    if (err) setError(err);
    setSubmitting(false);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.title}>Log in to 林间空地</h2>

      {error && <div className={styles.error}>{error}</div>}

      <input
        className={styles.input}
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />
      <input
        className={styles.input}
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="current-password"
      />

      <button className={styles.submitButton} type="submit" disabled={submitting}>
        {submitting ? 'Logging in...' : 'Log in'}
      </button>

      <p className={styles.switchText}>
        Don't have an account?
        <button type="button" className={styles.switchLink} onClick={onSwitchToRegister}>
          Sign up
        </button>
      </p>
    </form>
  );
}
