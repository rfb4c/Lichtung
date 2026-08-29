import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { isSupabaseConfigured } from './config'

/**
 * 未配置 Supabase 时不实例化真实客户端。
 *
 * supabase-js 在 url 为 undefined 时会同步抛异常，而本模块被 App.tsx / AuthContext.tsx
 * 顶层 import——异常发生在任何组件渲染之前，整棵 React 树挂载不上，各处的
 * isSupabaseConfigured 降级分支永远没机会执行。表现为零配置克隆后打开就是白屏。
 *
 * 哨兵对象只有在某个调用点漏掉 isSupabaseConfigured 判断时才会被碰到，
 * 此时抛出带说明的错误，比静默返回空数据更容易定位。
 */
function createUnconfiguredClient(): SupabaseClient {
  const handler: ProxyHandler<SupabaseClient> = {
    get(_target, prop) {
      throw new Error(
        `Supabase is not configured (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY missing), ` +
        `but supabase.${String(prop)} was accessed. ` +
        `This code path must be guarded by isSupabaseConfigured.`
      )
    },
  }
  return new Proxy({} as SupabaseClient, handler)
}

export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(
      import.meta.env.VITE_SUPABASE_URL as string,
      import.meta.env.VITE_SUPABASE_ANON_KEY as string
    )
  : createUnconfiguredClient()
