import { Search, BadgeCheck } from 'lucide-react';
import styles from './RightSidebar.module.css';

const trends = [
  { category: 'Politics · Trending', title: '#GunControl', posts: '12.5K' },
  { category: 'Politics · Trending', title: 'Abortion Rights', posts: '8,432' },
  { category: 'Climate · Trending', title: '#ClimatePolicy', posts: '5,621' },
];

const suggestions = [
  { name: 'AP News', handle: '@AP', verified: true },
  { name: 'BBC News', handle: '@BBCWorld', verified: true },
  { name: 'CNN', handle: '@CNN', verified: true },
];

export default function RightSidebar() {
  return (
    <aside className={styles.rightSidebar}>
      <div className={styles.searchBox}>
        <span className={styles.searchIcon}>
          <Search size={18} strokeWidth={1.75} />
        </span>
        <input type="text" placeholder="Search" className={styles.searchInput} />
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>What's happening</h2>
        {trends.map((trend) => (
          <div key={trend.title} className={styles.trendItem}>
            <div className={styles.trendCategory}>{trend.category}</div>
            <div className={styles.trendTitle}>{trend.title}</div>
            <div className={styles.trendPosts}>{trend.posts} posts</div>
          </div>
        ))}
        <div className={styles.showMore}>Show more</div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Who to follow</h2>
        {suggestions.map((user) => (
          <div key={user.handle} className={styles.userItem}>
            <div className={styles.avatar}></div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>
                {user.name}
                {user.verified && (
                  <BadgeCheck size={16} strokeWidth={2} style={{ marginLeft: 4, verticalAlign: 'text-bottom', color: 'var(--color-primary)' }} />
                )}
              </div>
              <div className={styles.userHandle}>{user.handle}</div>
            </div>
            <button className={styles.followButton}>Follow</button>
          </div>
        ))}
        <div className={styles.showMore}>Show more</div>
      </div>
    </aside>
  );
}
