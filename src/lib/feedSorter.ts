import type { Report } from '../types';

export type FeedMode = 'algorithm' | 'calibrated';

export function sortAlgorithm(reports: Report[]): Report[] {
  return [...reports].sort((a, b) =>
    (b.engagementScore ?? 0.5) - (a.engagementScore ?? 0.5)
  );
}

export function sortCalibrated(reports: Report[]): Report[] {
  // Step 1: base order by engagementScore
  const base = [...reports].sort((a, b) =>
    (b.engagementScore ?? 0.5) - (a.engagementScore ?? 0.5)
  );

  // Step 2: compute adjusted position per report
  // Hostile content: downranked per Piccardi et al. (2025) formula
  // Counter-stereotypical content: boosted into top 30%
  const withPositions = base.map((report, index) => {
    const position = index + 1;
    const hostility = report.hostilityScore ?? 0.3;
    let adjustedPosition = position;

    if (hostility >= 0.4) {
      adjustedPosition = position + position * hostility * 10;
    }
    if (report.counterStereotypical) {
      adjustedPosition = Math.max(1, position - Math.round(base.length * 0.3));
    }
    return { report, adjustedPosition };
  });

  // Step 3: sort by adjusted position ascending (lower = earlier in feed)
  withPositions.sort((a, b) => a.adjustedPosition - b.adjustedPosition);

  // Step 4: guarantee at least 1 counter-stereotypical per 4-report window
  const result = withPositions.map(x => x.report);
  const csReports = result.filter(r => r.counterStereotypical);
  let inserted = 0;
  for (let i = 3; i < result.length; i += 4) {
    const window = result.slice(i - 3, i + 1);
    const hasCS = window.some(r => r.counterStereotypical);
    if (!hasCS && csReports[inserted]) {
      const csIndex = result.indexOf(csReports[inserted]);
      if (csIndex !== -1) {
        result.splice(i, 0, result.splice(csIndex, 1)[0]);
        inserted++;
      }
    }
  }

  return result;
}
