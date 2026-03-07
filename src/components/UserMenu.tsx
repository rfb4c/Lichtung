import { useState } from 'react';
import { LogOut, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import styles from './UserMenu.module.css';

export default function UserMenu() {
  const { user, isAuthenticated, isConfigured, showAuth, handleLogout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!isConfigured) return null;

  if (!isAuthenticated) {
    return (
      <button className={styles.loginButton} onClick={() => showAuth('login')}>
        Log in
      </button>
    );
  }

  const initial = user?.displayName?.charAt(0) || '?';

  return (
    <div className={styles.userMenu}>
      <button className={styles.userButton} onClick={() => setMenuOpen(!menuOpen)}>
        <div className={styles.avatar}>{initial}</div>
        <div className={styles.userInfo}>
          <span className={styles.displayName}>{user?.displayName}</span>
          <span className={styles.handle}>
            @{user?.displayName?.toLowerCase().replace(/\s+/g, '') || 'user'}
          </span>
        </div>
        <MoreHorizontal size={18} strokeWidth={1.75} />
      </button>

      {menuOpen && (
        <div className={styles.dropdown}>
          <button
            className={styles.dropdownItem}
            onClick={() => {
              setMenuOpen(false);
              handleLogout();
            }}
          >
            <LogOut size={18} strokeWidth={1.75} />
            <span>Log out</span>
          </button>
        </div>
      )}
    </div>
  );
}
