import { Distribution, Stance } from '../types';
import styles from './SpectrumBar.module.css';

interface SpectrumBarProps {
  distribution: Distribution;
  currentStance: Stance;
}

const stanceLabels: Record<Stance, string> = {
  supportive: '支持',
  neutral: '中立',
  opposed: '反对',
};

function SpectrumBar({ distribution, currentStance }: SpectrumBarProps) {
  const segments: { key: Stance; value: number }[] = [
    { key: 'supportive', value: distribution.supportive },
    { key: 'neutral', value: distribution.neutral },
    { key: 'opposed', value: distribution.opposed },
  ];

  return (
    <div className={styles.bar}>
      {segments.map(({ key, value }) => (
        <div
          key={key}
          className={`${styles.segment} ${styles[key]} ${currentStance === key ? styles.current : ''}`}
          style={{ width: `${value}%` }}
        >
          <span className={styles.label}>{stanceLabels[key]}</span>
          <span className={styles.percent}>{value}%</span>
        </div>
      ))}
    </div>
  );
}

export default SpectrumBar;
