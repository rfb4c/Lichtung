import { useAuth } from '../contexts/AuthContext';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import styles from './AuthModal.module.css';

export default function AuthModal() {
  const { authModalMode, hideAuth, showAuth } = useAuth();

  if (!authModalMode) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) hideAuth();
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.card}>
        {authModalMode === 'login' ? (
          <LoginForm onSwitchToRegister={() => showAuth('register')} />
        ) : (
          <RegisterForm onSwitchToLogin={() => showAuth('login')} />
        )}
      </div>
    </div>
  );
}
