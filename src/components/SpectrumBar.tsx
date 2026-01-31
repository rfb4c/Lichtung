import { Distribution, Stance } from '../types';
import styles from './SpectrumBar.module.css';

interface SpectrumBarProps {
  distribution: Distribution;
  currentStance: Stance;
}

function SpectrumBar({ distribution, currentStance }: SpectrumBarProps) {
  return (
    <div className={styles.container}>
      {/* 顶部标签 */}
      <div className={styles.labels}>
        <span>支持</span>
        <span>中立</span>
        <span>反对</span>
      </div>

      {/* 光谱条 */}
      <div className={styles.bar}>
        <div
          className={styles.supportive}
          style={{ width: `${distribution.supportive}%` }}
        />
        <div
          className={styles.neutral}
          style={{ width: `${distribution.neutral}%` }}
        />
        <div
          className={styles.opposed}
          style={{ width: `${distribution.opposed}%` }}
        />
      </div>

      {/* 底部百分比 */}
      <div className={styles.percentages}>
        <span>{distribution.supportive}%</span>
        <span>{distribution.neutral}%</span>
        <span>{distribution.opposed}%</span>
      </div>

      {/* 当前立场标记 */}
      <div className={styles.markers}>
        <span className={currentStance === 'supportive' ? styles.markerActive : styles.markerHidden}>
          此报道
        </span>
        <span className={currentStance === 'neutral' ? styles.markerActive : styles.markerHidden}>
          此报道
        </span>
        <span className={currentStance === 'opposed' ? styles.markerActive : styles.markerHidden}>
          此报道
        </span>
      </div>
    </div>
  );
}

export default SpectrumBar;
