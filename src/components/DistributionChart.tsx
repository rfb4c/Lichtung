import { PollingData } from '../types';
import styles from './DistributionChart.module.css';

interface DistributionChartProps {
  pollingData: PollingData;
}

// Generate warm-to-cool color gradient
function getBarColors(count: number): string[] {
  const warmEnd = [212, 165, 116]; // #D4A574 Sand
  const coolEnd = [123, 107, 138];  // #7B6B8A Plum Grey

  return Array.from({ length: count }, (_, i) => {
    const ratio = count === 1 ? 0.5 : i / (count - 1);
    const r = Math.round(warmEnd[0] + (coolEnd[0] - warmEnd[0]) * ratio);
    const g = Math.round(warmEnd[1] + (coolEnd[1] - warmEnd[1]) * ratio);
    const b = Math.round(warmEnd[2] + (coolEnd[2] - warmEnd[2]) * ratio);
    return `rgb(${r}, ${g}, ${b})`;
  });
}

export default function DistributionChart({ pollingData }: DistributionChartProps) {
  const { scaleLabels, distribution, bridgingText, source, surveyYear, geographicScope } = pollingData;
  const colors = getBarColors(scaleLabels.length);

  // Find max value for scaling bars (guard against division by zero)
  const maxValue = Math.max(...distribution) || 1;

  return (
    <div className={styles.chartContainer}>
      {/* Bridging text */}
      <p className={styles.bridgingText}>{bridgingText}</p>

      {/* Bar chart */}
      <div className={styles.barsWrapper}>
        {scaleLabels.map((label, index) => {
          const percentage = distribution[index];
          const widthPercent = (percentage / maxValue) * 100;

          return (
            <div key={index} className={styles.barRow}>
              <div className={styles.labelSection}>
                <span className={styles.label}>{label}</span>
              </div>
              <div className={styles.barSection}>
                <div
                  className={styles.bar}
                  style={{
                    width: `${widthPercent}%`,
                    backgroundColor: colors[index],
                  }}
                >
                  <span className={styles.percentage}>{percentage}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Source attribution */}
      <p className={styles.sourceNote}>
        Source: {source} ({surveyYear}, {geographicScope})
      </p>
    </div>
  );
}
