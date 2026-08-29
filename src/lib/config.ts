const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// 占位值（技术设计文档里给出的示例 .env）视同未配置，否则会连到一个不存在的项目。
export const isSupabaseConfigured =
  !!url && !url.includes('your-project') &&
  !!key && !key.includes('your-anon-key');
