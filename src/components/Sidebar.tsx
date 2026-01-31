import styles from './Sidebar.module.css';

const menuItems = [
  { icon: '🏠', label: '主页', active: true },
  { icon: '🔍', label: '探索' },
  { icon: '🔔', label: '通知' },
  { icon: '👥', label: '关注' },
  { icon: '💬', label: '聊天' },
  { icon: '✨', label: 'Grok' },
  { icon: '🔖', label: '书签' },
  { icon: '👤', label: '个人资料' },
  { icon: '⋯', label: '更多' },
];

export default function Sidebar() {
  return (
    <nav className={styles.sidebar}>
      <div className={styles.logo}>𝕏</div>

      <ul className={styles.menu}>
        {menuItems.map((item) => (
          <li
            key={item.label}
            className={`${styles.menuItem} ${item.active ? styles.active : ''}`}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </li>
        ))}
      </ul>

      <button className={styles.postButton}>发帖</button>
    </nav>
  );
}
