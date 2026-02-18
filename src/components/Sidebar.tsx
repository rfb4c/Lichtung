import { useEffect, useState } from 'react';
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
import type { PageView } from '../App';
import styles from './Sidebar.module.css';

interface MenuItem {
  icon: LucideIcon;
  label: string;
  key: string;
  page?: PageView;
}

const menuItems: MenuItem[] = [
  { icon: Home, label: '主页', key: 'home', page: 'feed' },
  { icon: Search, label: '探索', key: 'explore' },
  { icon: Bell, label: '通知', key: 'notifications' },
  { icon: Users, label: '关注', key: 'following' },
  { icon: MessageCircle, label: '聊天', key: 'messages' },
  { icon: Sparkles, label: 'Grok', key: 'grok' },
  { icon: Bookmark, label: '书签', key: 'bookmarks' },
  { icon: User, label: '个人资料', key: 'profile', page: 'profile' },
  { icon: MoreHorizontal, label: '更多', key: 'more' },
];

interface SidebarProps {
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
}

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { isAuthenticated, showAuth } = useAuth();
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleMenuClick = (item: MenuItem) => {
    if (item.key === 'profile' && !isAuthenticated) {
      showAuth('login');
      return;
    }
    if (item.page) {
      onNavigate(item.page);
    }
  };

  const isActive = (item: MenuItem) => {
    if (item.page) return currentPage === item.page;
    return false;
  };

  return (
    <nav className={styles.sidebar}>
      <div className={styles.logo}>林间空地</div>

      <ul className={styles.menu}>
        {menuItems.map((item) => (
          <li
            key={item.key}
            className={`${styles.menuItem} ${isActive(item) ? styles.active : ''}`}
            onClick={() => handleMenuClick(item)}
          >
            <span className={styles.icon}>
              <item.icon size={24} strokeWidth={isActive(item) ? 2.5 : 1.75} />
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
    </nav>
  );
}
