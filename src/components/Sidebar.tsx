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
import styles from './Sidebar.module.css';

interface MenuItem {
  icon: LucideIcon;
  label: string;
  active?: boolean;
}

const menuItems: MenuItem[] = [
  { icon: Home, label: '主页', active: true },
  { icon: Search, label: '探索' },
  { icon: Bell, label: '通知' },
  { icon: Users, label: '关注' },
  { icon: MessageCircle, label: '聊天' },
  { icon: Sparkles, label: 'Grok' },
  { icon: Bookmark, label: '书签' },
  { icon: User, label: '个人资料' },
  { icon: MoreHorizontal, label: '更多' },
];

export default function Sidebar() {
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

  return (
    <nav className={styles.sidebar}>
      <div className={styles.logo}>林间空地</div>

      <ul className={styles.menu}>
        {menuItems.map((item) => (
          <li
            key={item.label}
            className={`${styles.menuItem} ${item.active ? styles.active : ''}`}
          >
            <span className={styles.icon}>
              <item.icon size={24} strokeWidth={item.active ? 2.5 : 1.75} />
            </span>
            <span className={styles.label}>{item.label}</span>
          </li>
        ))}
      </ul>

      <button className={styles.postButton}>发帖</button>

      <button className={styles.themeToggle} onClick={toggleTheme}>
        {theme === 'dark' ? <Sun size={20} strokeWidth={1.75} /> : <Moon size={20} strokeWidth={1.75} />}
        <span>{theme === 'dark' ? '浅色模式' : '深色模式'}</span>
      </button>
    </nav>
  );
}
