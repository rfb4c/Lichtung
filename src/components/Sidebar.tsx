import { useState, useEffect } from 'react';
import {
  Home,
  Search,
  Bell,
  Users,
  MessageCircle,
  Sparkles,
  Bookmark,
  User,
  MoreHorizontal,
  Sun,
  Moon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import UserMenu from './UserMenu';
import ProfileEditor from './ProfileEditor';
import styles from './Sidebar.module.css';

interface MenuItem {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  key: string;
}

const menuItems: MenuItem[] = [
  { icon: Home, label: '主页', active: true, key: 'home' },
  { icon: Search, label: '探索', key: 'explore' },
  { icon: Bell, label: '通知', key: 'notifications' },
  { icon: Users, label: '关注', key: 'following' },
  { icon: MessageCircle, label: '聊天', key: 'messages' },
  { icon: Sparkles, label: 'Grok', key: 'grok' },
  { icon: Bookmark, label: '书签', key: 'bookmarks' },
  { icon: User, label: '个人资料', key: 'profile' },
  { icon: MoreHorizontal, label: '更多', key: 'more' },
];

export default function Sidebar() {
  const { isAuthenticated, showAuth } = useAuth();
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'dark' | 'light') || 'dark';
  });
  const [showProfileEditor, setShowProfileEditor] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleMenuClick = (key: string) => {
    if (key === 'profile') {
      if (isAuthenticated) {
        setShowProfileEditor(true);
      } else {
        showAuth('login');
      }
    }
  };

  return (
    <nav className={styles.sidebar}>
      <div className={styles.logo}>林间空地</div>

      <ul className={styles.menu}>
        {menuItems.map((item) => (
          <li
            key={item.key}
            className={`${styles.menuItem} ${item.active ? styles.active : ''}`}
            onClick={() => handleMenuClick(item.key)}
          >
            <span className={styles.icon}>
              <item.icon size={24} strokeWidth={item.active ? 2.5 : 1.75} />
            </span>
            <span className={styles.label}>{item.label}</span>
          </li>
        ))}
      </ul>

      <button className={styles.postButton}>发帖</button>

      <UserMenu />

      <button className={styles.themeToggle} onClick={toggleTheme}>
        {theme === 'dark' ? <Sun size={20} strokeWidth={1.75} /> : <Moon size={20} strokeWidth={1.75} />}
        <span>{theme === 'dark' ? '浅色模式' : '深色模式'}</span>
      </button>

      {showProfileEditor && (
        <ProfileEditor onClose={() => setShowProfileEditor(false)} />
      )}
    </nav>
  );
}
