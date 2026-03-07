import type { Topic, Report } from '../types';

/**
 * Match a report to a subtopic or topic based on keyword matching
 *
 * Strategy:
 * 1. Try to match subtopics first (more granular)
 * 2. If no subtopic matches, fallback to topic
 * 3. Require 2+ keyword matches to reduce false positives
 */
export function matchReportToTopic(
  report: Report,
  topics: Topic[]
): { topicId?: string; subtopicId?: string } {
  const content = `${report.title} ${report.summary}`.toLowerCase();

  // Step 1: Try to match subtopics (more specific)
  for (const topic of topics) {
    if (!topic.subtopics) continue;

    for (const subtopic of topic.subtopics) {
      const matchCount = countKeywordMatches(content, subtopic.tagKeywords);

      // If 2+ keywords match, assign this subtopic
      if (matchCount >= 2) {
        return {
          topicId: topic.id,
          subtopicId: subtopic.id,
        };
      }
    }
  }

  // Step 2: Fallback to topic-level matching
  for (const topic of topics) {
    const matchCount = countKeywordMatches(content, topic.tagKeywords);

    // If 2+ keywords match, assign this topic
    if (matchCount >= 2) {
      return {
        topicId: topic.id,
      };
    }
  }

  // Step 3: No match found
  return {};
}

/**
 * Count how many keywords from the list appear in the content
 */
function countKeywordMatches(content: string, keywords: string[]): number {
  return keywords.filter((keyword) =>
    content.includes(keyword.toLowerCase())
  ).length;
}

/**
 * Batch match all reports to topics
 */
export function matchAllReports(
  reports: Report[],
  topics: Topic[]
): Report[] {
  return reports.map((report) => {
    // If report already has topicId/subtopicId, skip matching
    if (report.topicId || report.subtopicId) {
      return report;
    }

    const match = matchReportToTopic(report, topics);
    return {
      ...report,
      topicId: match.topicId,
      subtopicId: match.subtopicId,
    };
  });
}
