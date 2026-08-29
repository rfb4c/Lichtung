/**
 * 逐条实测 app-data.json 里所有 imageUrl 是否真的能加载。
 *
 * 配图全部是热链第三方新闻机构的 CDN，随时可能因防盗链、改版或删图而失效；
 * 失效时 <img> 只是静默留白，界面上看不出问题，录视频或现场演示时才会发现。
 * 所以这项检查要能随时重跑。
 *
 * 用法：node scripts/check-image-urls.mjs
 * 退出码：全部通过 0，有失败 1
 */
import fs from 'fs';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
           '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const REFERER = 'http://localhost:5173/';
const TIMEOUT_MS = 10000;

const d = JSON.parse(fs.readFileSync('src/data/app-data.json', 'utf8'));

async function probe(url) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: ctl.signal,
      headers: {
        'User-Agent': UA, Referer: REFERER,
        Accept: 'image/avif,image/webp,image/*,*/*;q=0.8',
        // 只要响应头即可判定，用 Range 避免把整张图拉下来
        Range: 'bytes=0-0',
      },
    });
    const ct = res.headers.get('content-type') || '';
    res.body?.cancel().catch(() => {});
    return { ok: res.ok && ct.startsWith('image/'), status: res.status, ct };
  } catch (e) {
    return { ok: false, status: 'ERR', ct: e.name === 'AbortError' ? '超时' : e.message };
  } finally {
    clearTimeout(timer);
  }
}

const results = await Promise.all(
  d.reports.map(async (r) => ({ id: r.id, url: r.imageUrl, ...(await probe(r.imageUrl)) }))
);

const failed = results.filter((r) => !r.ok);
for (const r of results) {
  console.log(`${r.ok ? '✅' : '❌'} ${r.id.padEnd(20)} ${String(r.status).padEnd(5)} ${r.ct}`);
}
console.log(`\n${results.length - failed.length}/${results.length} 可加载`);
if (failed.length) {
  console.log('\n失效条目：');
  failed.forEach((r) => console.log(`  ${r.id}  ${r.url}`));
  process.exit(1);
}
