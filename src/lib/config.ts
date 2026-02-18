export const isSupabaseConfigured =
  !!import.meta.env.VITE_SUPABASE_URL &&
  !import.meta.env.VITE_SUPABASE_URL.includes('your-project');
