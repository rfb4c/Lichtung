# 报道配图溯源表

> **用途**：记录每篇报道的配图来自哪个出版方，以及它与报道标注来源是否一致。
> 本表由 `scripts/gen-image-provenance.mjs` 生成，数据源 `src/data/app-data.json`，改数据后重跑即可。
> 报道集初次建立 2026-03-07，最后修订 2026-08-30。

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

**配图：✅ 35 · ⚠️ 1 · ❌ 0（共 36 条）**

**原文链接与标注来源不一致：0 条**

## 明细

| 报道 ID | 标注来源 | 配图实际出版方 | 配图 | 原文链接 | 链接 |
|---|---|---|---|---|---|
| `rp_gun_001` | CBS Austin | CBS Austin | ✅ | ✅ | [原文](https://cbsaustin.com/news/local/multiple-people-injured-in-mass-shooting-on-6th-st-austin-police-investigating) · [图片](https://cbsaustin.com/resources/media2/16x9/6048/1320/0x44/90/a6fa45fa-99dd-47e0-b131-43418bc6ac5e-AP26060561690822.jpg) |
| `rp_gun_002` | Maryland Matters | FOX Baltimore | ⚠️ 实为 FOX Baltimore | ✅ | [原文](https://marylandmatters.org/2026/01/21/appeals-court-upholds-most-of-maryland-ban-on-weapons-in-schools-parks-other-public-places/) · [图片](https://foxbaltimore.com/resources/media2/16x9/6000/986/0x313/90/9ede23ec-c9c5-4bc5-8658-fe6ed97ad0ac-GettyImages2211996655.jpg) |
| `rp_gun_003` | CNN | CNN | ✅ | ✅ | [原文](https://www.cnn.com/2026/01/03/us/california-ban-openly-carrying-gun-unconstitutional-hnk) · [图片](https://media.cnn.com/api/v1/images/stellar/prod/usatsi-13933218.jpg?c=16x9&q=w_800,c_fill) |
| `rp_gun_004` | CNN | CNN | ✅ | ✅ | [原文](https://www.cnn.com/2026/02/01/politics/gun-politics-trump-second-amendment) · [图片](https://media.cnn.com/api/v1/images/stellar/prod/ap22148014227135a.JPG?c=16x9&q=w_800,c_fill) |
| `rp_gun_005` | Washington Post | Washington Post | ✅ | ✅ | [原文](https://www.washingtonpost.com/politics/2026/03/02/supreme-court-marijuana-gun-hemani/) · [图片](https://www.washingtonpost.com/wp-apps/imrs.php?src=https://arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/AVY3S2K6LDSCSJIBE6E4QQANEU_size-normalized.jpg&w=1440&impolicy=high_res) |
| `rp_gun_006` | Washington Post | Washington Post | ✅ | ✅ | [原文](https://www.washingtonpost.com/national-security/2026/01/19/trump-justice-department-gun-regulations-atf/) · [图片](https://www.washingtonpost.com/wp-apps/imrs.php?src=https://cloudfront-us-east-1.images.arcpublishing.com/wapo/NJ2W7T2MBPYHQKK2QOLOZX4SMA.JPG&w=1440&impolicy=high_res) |
| `rp_gun_007` | CNN | CNN | ✅ | ✅ | [原文](https://www.cnn.com/2026/02/01/us/gun-rights-politics-alex-pretti-killing-cec) · [图片](https://media.cnn.com/api/v1/images/stellar/prod/gettyimages-2257847778.jpg?c=16x9&q=w_800,c_fill) |
| `rp_gun_008` | CNN | CNN | ✅ | ✅ | [原文](https://www.cnn.com/2026/01/27/politics/gun-alex-pretti-ice-nra) · [图片](https://media.cnn.com/api/v1/images/stellar/prod/ap26027626289799.jpg?c=16x9&q=w_800,c_fill) |
| `rp_abortion_001` | Washington Post | Washington Post | ✅ | ✅ | [原文](https://www.washingtonpost.com/nation/2026/01/06/wyoming-court-abortion-pill-ban/) · [图片](https://www.washingtonpost.com/wp-apps/imrs.php?src=https://arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/4RM2BRMEWMG5QMCSNDTBSWZK7Y.jpg&w=1440) |
| `rp_abortion_002` | CNN | CNN | ✅ | ✅ | [原文](https://edition.cnn.com/2026/02/18/health/abortion-clinic-closures-guttmacher) · [图片](https://media.cnn.com/api/v1/images/stellar/prod/gettyimages-1237884449.jpg?c=original) |
| `rp_abortion_003` | CNN | CNN | ✅ | ✅ | [原文](https://www.cnn.com/2026/01/28/politics/abortion-ban-veterans-affairs-roe-wade) · [图片](https://media.cnn.com/api/v1/images/stellar/prod/2025-02-20t173249z-1567173878-rc2gycaqrf5j-rtrmadp-3-usa-trump-workers.JPG?c=16x9&q=w_800,c_fill) |
| `rp_abortion_004` | State Court Report | State Court Report | ✅ | ✅ | [原文](https://statecourtreport.org/our-work/analysis-opinion/2026-abortion-related-ballot-measures) · [图片](https://statecourtreport.org/sites/default/files/styles/3_1_1120x373/public/2023-11/2023_09_SCR_Abortion_Rights%20%282%29.webp?h=043d26d4&itok=gqsBYXyP) |
| `rp_abortion_005` | Washington Post | Washington Post | ✅ | ✅ | [原文](https://www.washingtonpost.com/ripple/2026/02/25/abortion-laws-show-that-public-policy-doesnt-always-line-up-with-public-opinion/) · [图片](https://www.washingtonpost.com/wp-apps/imrs.php?src=https://cloudfront-us-east-1.images.arcpublishing.com/wapo/DTJFYG5FY2XDOLXUZH4ND55FC4.JPG&w=1440&impolicy=high_res) |
| `rp_abortion_006` | CNN | CNN | ✅ | ✅ | [原文](https://www.cnn.com/2026/01/17/politics/abortion-shield-laws-louisiana-california-texas) · [图片](https://media.cnn.com/api/v1/images/stellar/prod/c-ap23103847076018.jpg?c=original&q=w_860,c_fill) |
| `rp_abortion_007` | NPR | NPR | ✅ | ✅ | [原文](https://www.npr.org/2026/01/23/nx-s1-5683204/abortion-trump-mexico-city-policy) · [图片](https://npr.brightspotcdn.com/dims3/default/strip/false/crop/2572x1716+0+0/resize/1100/quality/50/format/png/?url=http%3A%2F%2Fnpr-brightspot.s3.amazonaws.com%2F5a%2F5e%2F77c5292f48f1bb7aca17bdd22469%2Fmexico-city-madagascar.png) |
| `rp_abortion_008` | Ballotpedia | 未登记（ballotpedia.s3.amazonaws.com） | ✅ | ✅ | [原文](https://ballotpedia.org/Missouri_Amendment_3,_Prohibit_Abortion_and_Gender_Transition_Procedures_for_Minors_Amendment_(2026)) · [图片](https://ballotpedia.s3.amazonaws.com/images/a/a8/Elections_to_watch.png) |
| `rp_climate_001` | Washington Post | Washington Post | ✅ | ✅ | [原文](https://www.washingtonpost.com/climate-environment/2026/02/12/endangerment-finding-repeal/) · [图片](https://www.washingtonpost.com/wp-apps/imrs.php?src=https://arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/BI3TX7QLYMI6DDYI6MJ5WGVRHA&w=1440) |
| `rp_climate_002` | Washington Post | Washington Post | ✅ | ✅ | [原文](https://www.washingtonpost.com/climate-environment/2026/01/12/epa-public-health-pollution-costs/) · [图片](https://www.washingtonpost.com/wp-apps/imrs.php?src=https://arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/SXYZX7WFTOPBIZGAEYV44ETMTA_size-normalized.JPG&w=1800&h=1800) |
| `rp_climate_003` | Justia | Justia | ✅ | ✅ | [原文](https://supreme.justia.com/cases/federal/us/549/497/) · [图片](https://justatic.com/v/20260728144057/shared/images/social-media/law.jpg) |
| `rp_climate_004` | Bloomberg | Bloomberg | ✅ | ✅ | [原文](https://www.bloomberg.com/opinion/articles/2026-02-25/climate-change-net-zero-is-dead-long-live-renewable-energy) · [图片](https://assets.bwbx.io/images/users/iqjWHBFdfxIU/iMvcUDmdpH48/v0/-1x-1.webp) |
| `rp_climate_005` | EIA | EIA | ✅ | ✅ | [原文](https://www.eia.gov/todayinenergy/detail.php?id=67205) · [图片](https://www.eia.gov/todayinenergy/images/2026.02.20/main.svg) |
| `rp_climate_006` | Washington Post | Washington Post | ✅ | ✅ | [原文](https://www.washingtonpost.com/climate-environment/2026/01/05/epa-rollbacks-strategy-courts/) · [图片](https://www.washingtonpost.com/wp-apps/imrs.php?src=https://arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/WVYSWUC5NJHYFHXT6YOIQSLFJI_size-normalized.jpg&w=1800&h=1800) |
| `rp_climate_007` | Washington Post | Washington Post | ✅ | ✅ | [原文](https://www.washingtonpost.com/opinions/2026/02/18/epa-emissions-reversal-energy-steven-koonin/) · [图片](https://www.washingtonpost.com/wp-apps/imrs.php?src=https://arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/YTJHJLAUP54SVBABQND4RE3XVM_size-normalized.jpg&w=1440&impolicy=high_res) |
| `rp_climate_008` | NBC News | NBC News | ✅ | ✅ | [原文](https://www.nbcnews.com/weather/heat/deadliest-extreme-weather-event-not-think-rcna219702) · [图片](https://media-cldnry.s-nbcnews.com/image/upload/t_nbcnews-fp-1200-630,f_auto,q_auto:best/rockcms/2025-07/250721-extreme-heat-se-1019a-3c778e.jpg) |
| `rp_gun_010` | NBC News | NBC News | ✅ | ✅ | [原文](https://www.nbcnews.com/politics/congress/quiet-bipartisan-effort-gun-background-checks-may-be-verge-deal-n1268630) · [图片](https://media-cldnry.s-nbcnews.com/image/upload/t_nbcnews-fp-1200-630,f_auto,q_auto:best/newscms/2021_21/3477890/210526-background-checks-mb-1637.jpg) |
| `rp_abortion_010` | ProPublica | ProPublica | ✅ | ✅ | [原文](https://www.propublica.org/article/republicans-face-backlash-after-challenging-abortion-bans) · [图片](https://www.propublica.org/wp-content/uploads/2026/06/20260603-abortion-reforms-punished-murphy-campaign.jpg?w=1149) |
| `rp_climate_010` | Grist | Grist | ✅ | ✅ | [原文](https://grist.org/energy/americas-largest-coal-miners-union-supports-clean-energy-with-conditions/) · [图片](https://grist.org/wp-content/uploads/2021/04/UMWA-coal-miner-workers-energy-e1618871598667.jpg?quality=75&strip=all) |
| `rp_immigration_001` | CNN | CNN | ✅ | ✅ | [原文](https://www.cnn.com/2025/09/23/politics/us-citizen-children-separated-parents-deported-ice-invs) · [图片](https://media.cnn.com/api/v1/images/stellar/prod/20250715-dvb-a7a-0806-mp4-00-01-39-16-still002.jpg?c=16x9&q=w_800,c_fill) |
| `rp_immigration_002` | Texas Tribune | Texas Tribune | ✅ | ✅ | [原文](https://www.texastribune.org/2025/05/13/texas-houston-ice-deportations/) · [图片](https://i0.wp.com/www.texastribune.org/wp-content/uploads/2025/05/040120ICE20Raid20Minor20EG20TT2037-1-scaled.jpg?fit=2560%2C1707&quality=100&ssl=1&w=1200&h=630) |
| `rp_immigration_003` | NPR | NPR | ✅ | ✅ | [原文](https://www.npr.org/2025/06/07/nx-s1-5426518/ice-conducts-sweeping-raids-in-l-a-clashes-with-protestors) · [图片](https://media.npr.org/include/images/facebook-default-wide-s1400-c85.jpg) |
| `rp_immigration_004` | CBS News | CBS News | ✅ | ✅ | [原文](https://www.cbsnews.com/news/ices-detainee-population-record-high-of-73000/) · [图片](https://assets1.cbsnewsstatic.com/hub/i/r/2026/01/16/7203659a-8e83-4eaf-a314-32b09df3c2fa/thumbnail/1200x630g2/c91beb0b21f9a829523f50822384f334/gettyimages-2241660050.jpg) |
| `rp_immigration_005` | PBS NewsHour | PBS NewsHour | ✅ | ✅ | [原文](https://www.pbs.org/newshour/politics/foreigners-in-u-s-must-apply-for-green-cards-abroad-new-trump-administration-rule-says) · [图片](https://d3i6fh83elv35t.cloudfront.net/static/2026/05/2018-07-18T191619Z_1506837021_RC1DA436B7F0_RTRMADP_3_USA-IMMIGRATION-NATURALIZATION-1024x683.jpg) |
| `rp_immigration_006` | NPR | NPR | ✅ | ✅ | [原文](https://www.npr.org/2026/04/25/nx-s1-5798943/justice-department-makes-it-easier-to-deport-those-with-daca-status) · [图片](https://npr.brightspotcdn.com/dims3/default/strip/false/crop/4500x2531+0+234/resize/1400/quality/85/format/jpeg/?url=http%3A%2F%2Fnpr-brightspot.s3.amazonaws.com%2Fed%2Fd5%2F5ef2db7749eba5efd5ac75d25777%2Fgettyimages-1137865525.jpg) |
| `rp_immigration_007` | NPR | NPR | ✅ | ✅ | [原文](https://www.npr.org/2026/06/30/nx-s1-5839358/birthright-citizenship-decision-scotus-trump) · [图片](https://npr.brightspotcdn.com/dims3/default/strip/false/crop/8317x4678+0+433/resize/1400/quality/85/format/jpeg/?url=http%3A%2F%2Fnpr-brightspot.s3.amazonaws.com%2F56%2Fd2%2F6c6ec3594b828e8a0c5078dd3576%2Fgettyimages-1260960662-1.jpg) |
| `rp_immigration_008` | Texas Tribune | Texas Tribune | ✅ | ✅ | [原文](https://www.texastribune.org/2025/07/02/texas-trump-asylum-federal-judge-order/) · [图片](https://i0.wp.com/www.texastribune.org/wp-content/uploads/2025/07/Eagle20Pass20Asylum20Seek20REUTERS-1-scaled.jpg?fit=2560%2C1707&quality=100&ssl=1&w=1200&h=630) |
| `rp_immigration_009` | NPR | NPR | ✅ | ✅ | [原文](https://www.npr.org/2026/06/25/nx-s1-5838860/supreme-court-asylum-policy) · [图片](https://npr.brightspotcdn.com/dims3/default/strip/false/crop/7847x4414+0+409/resize/1400/quality/85/format/jpeg/?url=http%3A%2F%2Fnpr-brightspot.s3.amazonaws.com%2Ff3%2Fe3%2F35bd706049059c4648268e50ad67%2Fgettyimages-2159564157.jpg) |
