import { useEffect, useState } from 'react';
import {
  Home,
  Search,
  Bell,
  Users,
  MessageCircle,
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
  { icon: Home, label: 'Home', key: 'home', page: 'feed' },
  { icon: Search, label: 'Explore', key: 'explore' },
  { icon: Bell, label: 'Notifications', key: 'notifications' },
  { icon: Users, label: 'Following', key: 'following' },
  { icon: MessageCircle, label: 'Messages', key: 'messages' },
  { icon: Bookmark, label: 'Bookmarks', key: 'bookmarks' },
  { icon: User, label: 'Profile', key: 'profile', page: 'profile' },
  { icon: MoreHorizontal, label: 'More', key: 'more' },
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

  const bottomNavItems = menuItems.filter((item) =>
    ['home', 'explore', 'notifications', 'profile'].includes(item.key)
  );

  return (
    <>
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

        <button className={styles.postButton}>Post</button>

        <UserMenu />

        <button className={styles.themeToggle} onClick={toggleTheme}>
          {theme === 'dark' ? <Sun size={20} strokeWidth={1.75} /> : <Moon size={20} strokeWidth={1.75} />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </nav>

      <nav className={styles.bottomNav}>
        {bottomNavItems.map((item) => (
          <button
            key={item.key}
            className={`${styles.bottomNavItem} ${isActive(item) ? styles.bottomNavActive : ''}`}
            onClick={() => handleMenuClick(item)}
            aria-label={item.label}
          >
            <item.icon size={24} strokeWidth={isActive(item) ? 2.5 : 1.75} />
          </button>
        ))}
        <button
          className={styles.bottomNavItem}
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={22} strokeWidth={1.75} /> : <Moon size={22} strokeWidth={1.75} />}
        </button>
      </nav>
    </>
  );
}
