import { Search, BadgeCheck } from 'lucide-react';
import styles from './RightSidebar.module.css';

const trends = [
  { category: '科技 · 趋势', title: '#AI监管新规', posts: '1.2万' },
  { category: '政治 · 趋势', title: '禁燃油车', posts: '8,432' },
  { category: '教育 · 趋势', title: '#双减政策', posts: '5,621' },
];

const suggestions = [
  { name: '求是', handle: '@qstheory', verified: true },
  { name: '新华社', handle: '@xinhuashefabu1', verified: true },
  { name: '人民日报', handle: '@PDChinese', verified: true },
];

export default function RightSidebar() {
  return (
    <aside className={styles.rightSidebar}>
      <div className={styles.searchBox}>
        <span className={styles.searchIcon}>
          <Search size={18} strokeWidth={1.75} />
        </span>
        <input type="text" placeholder="搜索" className={styles.searchInput} />
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>有什么新鲜事</h2>
        {trends.map((trend) => (
          <div key={trend.title} className={styles.trendItem}>
            <div className={styles.trendCategory}>{trend.category}</div>
            <div className={styles.trendTitle}>{trend.title}</div>
            <div className={styles.trendPosts}>{trend.posts} 帖子</div>
          </div>
        ))}
        <div className={styles.showMore}>显示更多</div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>推荐关注</h2>
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
            <button className={styles.followButton}>关注</button>
          </div>
        ))}
        <div className={styles.showMore}>显示更多</div>
      </div>
    </aside>
  );
}
