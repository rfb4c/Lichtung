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

// 优先显示调查执行期；只有 surveyYear 的旧条目仍显示年份
function formatPeriod({ fieldDates, surveyYear }: PollingData): string {
  return fieldDates ?? String(surveyYear);
}

// n=8,709 U.S. adults —— 两个字段各自可缺
function formatSample({ sampleSize, population }: PollingData): string | null {
  const parts = [
    sampleSize !== undefined ? `n=${sampleSize.toLocaleString('en-US')}` : null,
    population ?? null,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : null;
}

export default function DistributionChart({ pollingData }: DistributionChartProps) {
  const {
    scaleLabels,
    distribution,
    bridgingText,
    questionWording,
    source,
    sourceUrl,
    geographicScope,
    dontKnowPct,
  } = pollingData;
  const colors = getBarColors(scaleLabels.length);

  const attribution = `${source} (${formatPeriod(pollingData)}, ${geographicScope})`;
  const sample = formatSample(pollingData);

  return (
    <div className={styles.chartContainer}>
      {/* Bridging text */}
      <p className={styles.bridgingText}>{bridgingText}</p>

      {/*
        原始题干。读者要能确认下面这组数字回答的到底是哪一个问题——
        没有它，图表只是一串无从核实的百分比。
      */}
      {questionWording && (
        <blockquote className={styles.questionWording}>{questionWording}</blockquote>
      )}

      {/* Bar chart */}
      <div className={styles.barsWrapper}>
        {scaleLabels.map((label, index) => {
          const percentage = distribution[index];
          const widthPercent = percentage;

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

      {/*
        无意见档已从分布中剔除并对有效回答重新归一化，必须注明，
        否则读者会把这里的百分比当成占全部受访者的比例。
      */}
      {dontKnowPct !== undefined && (
        <p className={styles.sourceNote}>
          Percentages are among respondents expressing an opinion; {dontKnowPct}% offered
          none.
        </p>
      )}

      {/* Source attribution */}
      <p className={styles.sourceNote}>
        Source:{' '}
        {sourceUrl ? (
          <a
            className={styles.sourceLink}
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {attribution}
          </a>
        ) : (
          attribution
        )}
        {sample && ` · ${sample}`}
      </p>
    </div>
  );
}
