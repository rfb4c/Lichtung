/**
 * 生成报道配图溯源表 docs/image-provenance.md
 *
 * 检查两件事：
 *   1. 配图的实际出版方与报道标注来源是否一致
 *   2. 原文链接的域名与报道标注来源是否一致
 *
 * 用法：node scripts/gen-image-provenance.mjs
 */
import fs from 'fs';
import { execSync } from 'child_process';

const d = JSON.parse(fs.readFileSync('src/data/app-data.json', 'utf8'));

/** 域名 → 真实出版方。未登记的域名会在表中原样标出，提醒补充。 */
const PUBLISHER = {
  'media.cnn.com': 'CNN',
  'www.cnn.com': 'CNN',
  'edition.cnn.com': 'CNN',
  'i.guim.co.uk': 'The Guardian',
  'media-cldnry.s-nbcnews.com': 'NBC News',
  'www.nbcnews.com': 'NBC News',
  'media.nbcdfw.com': 'NBC 5 Dallas-Fort Worth',
  'npr.brightspotcdn.com': 'NPR',
  'www.npr.org': 'NPR',
  'assets.bwbx.io': 'Bloomberg',
  'www.bloomberg.com': 'Bloomberg',
  'foxbaltimore.com': 'FOX Baltimore',
  'www.motherjones.com': 'Mother Jones',
  'www.pewresearch.org': 'Pew Research Center',
  'statecourtreport.org': 'State Court Report',
  'www.worldpressphoto.org': 'World Press Photo',
  'www.washingtonpost.com': 'Washington Post',
  'www.eia.gov': 'EIA',
  'www.propublica.org': 'ProPublica',
  'grist.org': 'Grist',
  'ballotpedia.org': 'Ballotpedia',
  'marylandmatters.org': 'Maryland Matters',
  'cbsaustin.com': 'CBS Austin',
  'supreme.justia.com': 'Justia',
  'static.wixstatic.com': '不可考（第三方 Wix 站点图床）',
  'encrypted-tbn0.gstatic.com': '不可考（Google 图片缩略图缓存）',
  'tse4.mm.bing.net': '不可考（Bing 图片缩略图缓存）',
};

/** 搜索引擎缩略图缓存：既非出版方图源，链接也不稳定，必须更换 */
const SEARCH_CACHE = ['encrypted-tbn0.gstatic.com', 'tse4.mm.bing.net'];

const host = (u) => { try { return new URL(u).host; } catch { return ''; } };
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const same = (a, b) => {
  const [x, y] = [norm(a), norm(b)];
  return x === y || x.includes(y) || y.includes(x);
};
const publisherOf = (h) => PUBLISHER[h] || `未登记（${h || '空'}）`;

const stats = { imgOk: 0, imgMismatch: 0, imgCache: 0, artMismatch: 0 };
const rows = d.reports.map((r) => {
  const ih = host(r.imageUrl || '');
  const imgPub = publisherOf(ih);
  let imgStatus;
  if (SEARCH_CACHE.includes(ih)) { imgStatus = '❌ 搜索引擎缓存'; stats.imgCache++; }
  else if (same(imgPub, r.source)) { imgStatus = '✅'; stats.imgOk++; }
  else { imgStatus = `⚠️ 实为 ${imgPub}`; stats.imgMismatch++; }

  const ah = host(r.url || '');
  const artPub = publisherOf(ah);
  let artStatus = '✅';
  if (!same(artPub, r.source)) { artStatus = `⚠️ 实为 ${artPub}`; stats.artMismatch++; }

  return `| \`${r.id}\` | ${r.source} | ${imgPub} | ${imgStatus} | ${artStatus} | [原文](${r.url}) · [图片](${r.imageUrl}) |`;
});

const gitDate = (args) =>
  execSync(`git log ${args} --format=%ad --date=short -- src/data/app-data.json`).toString().trim();

const md = `# 报道配图溯源表

> **用途**：记录每篇报道的配图来自哪个出版方，以及它与报道标注来源是否一致。
> 本表由 \`scripts/gen-image-provenance.mjs\` 生成，数据源 \`src/data/app-data.json\`，改数据后重跑即可。
> 报道集初次建立 ${gitDate('--diff-filter=A -1')}，最后修订 ${gitDate('-1')}。

## 关于版权的事实陈述

- **本仓库不存放任何第三方图片副本，只存 URL。** 图片由浏览器在渲染时直接向出版方 CDN 请求，
  本项目不构成对这些图片的复制或再分发。
- 配图为第三方新闻机构的编辑图片，在本原型中仅用于呈现新闻卡片界面，不作独立的图片展示用途。
- 报道正文（标题与摘要）为研究者基于真实新闻事件改写，非逐字转载。

## 状态说明

| 标记 | 含义 | 处置 |
|---|---|---|
| ✅ | 与标注来源一致 | 无需处理 |
| ⚠️ | 来自另一家出版方 | 需处置：改标注来源以匹配实际出处，或更换素材 |
| ❌ | 来自搜索引擎缩略图缓存 | **必须更换**：既非出版方图源，链接也不稳定 |

**配图：✅ ${stats.imgOk} · ⚠️ ${stats.imgMismatch} · ❌ ${stats.imgCache}（共 ${d.reports.length} 条）**

**原文链接与标注来源不一致：${stats.artMismatch} 条**

## 明细

| 报道 ID | 标注来源 | 配图实际出版方 | 配图 | 原文链接 | 链接 |
|---|---|---|---|---|---|
${rows.join('\n')}
`;

fs.writeFileSync('docs/image-provenance.md', md);
console.log(`配图 ✅${stats.imgOk} ⚠️${stats.imgMismatch} ❌${stats.imgCache} | 原文链接不一致 ${stats.artMismatch} → docs/image-provenance.md`);
