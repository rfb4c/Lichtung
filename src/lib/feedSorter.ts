import type { Report } from '../types';

export type FeedMode = 'algorithm' | 'calibrated';

export function sortAlgorithm(reports: Report[]): Report[] {
  return [...reports].sort((a, b) =>
    (b.engagementScore ?? 0.5) - (a.engagementScore ?? 0.5)
  );
}

export function sortCalibrated(reports: Report[]): Report[] {
  // Counter-stereotypical exemplars surface to the top.
  // Within each group, preserve engagement-score order.
  const byEngagement = (a: Report, b: Report) =>
    (b.engagementScore ?? 0.5) - (a.engagementScore ?? 0.5);

  const cs    = reports.filter(r =>  r.counterStereotypical).sort(byEngagement);
  const nonCs = reports.filter(r => !r.counterStereotypical).sort(byEngagement);

  return [...cs, ...nonCs];
}
