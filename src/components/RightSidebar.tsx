import { useState } from 'react';
import { Search, Compass } from 'lucide-react';
import styles from './RightSidebar.module.css';

interface RightSidebarProps {
  onTopicFilter: (query: string) => void;
}

export default function RightSidebar({ onTopicFilter }: RightSidebarProps) {
  const [searchValue, setSearchValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onTopicFilter(searchValue.trim());
    }
  };

  return (
    <aside className={styles.rightSidebar}>
      <div className={styles.searchBox}>
        <span className={styles.searchIcon}>
          <Search size={18} strokeWidth={1.75} />
        </span>
        <input
          type="text"
          placeholder="Search topics"
          className={styles.searchInput}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <Compass size={18} strokeWidth={1.75} />
          <h2 className={styles.cardTitle}>Discover New Topics</h2>
        </div>
        <p className={styles.cardDescription}>
          Explore less-covered issues and broaden your information diet.
        </p>
        <div className={styles.comingSoon}>Coming soon</div>
      </div>
    </aside>
  );
}
