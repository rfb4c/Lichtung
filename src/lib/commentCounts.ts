import appData from '../data/app-data.json';

/**
 * 静态数据里每篇报道的真实评论数。
 *
 * 两种模式都以它为基线：静态模式下评论区渲染的就是 mockComments；
 * Supabase 模式下，数据库没有该报道评论时 CommentSection 也回落到 mockComments，
 * 所以基线一致，数据库计数只是覆盖在它之上。
 */
export const staticCommentCounts: Record<string, number> = {};

for (const c of appData.mockComments ?? []) {
  staticCommentCounts[c.reportId] = (staticCommentCounts[c.reportId] ?? 0) + 1;
}
