import { Event, Stance } from '../types';
import SpectrumBar from './SpectrumBar';
import styles from './DistributionTooltip.module.css';

interface DistributionTooltipProps {
  event: Event;
  currentStance: Stance;
  visible: boolean;
}

export default function DistributionTooltip({
  event,
  currentStance,
  visible,
}: DistributionTooltipProps) {
  if (!visible) return null;

  return (
    <div className={styles.tooltip}>
      <div className={styles.title}>关于「{event.title}」</div>

      <SpectrumBar distribution={event.distribution} currentStance={currentStance} />

      <div className={styles.footer}>基于报道的分布统计</div>
    </div>
  );
}
