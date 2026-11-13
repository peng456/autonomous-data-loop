// 部署后主动推送：IndexNow（Bing / Yandex / Seznam 秒级发现，不用等爬虫自然来）
// 用法：node tools/indexnow.mjs
// 依赖部署已完成（会先拉线上 sitemap.xml 再提交，顺带验证部署是否生效）。
const SITE = 'https://peng456.github.io/autonomous-data-loop';
const KEY = '8f3c1d6a4b9e27c05a7d31f8e6b2c940';
const HOST = new URL(SITE).host;

const res0 = await fetch(`${SITE}/sitemap.xml`, { cache: 'no-store' });
if (!res0.ok) {
  console.log(`✗ 拉取 sitemap 失败：HTTP ${res0.status}`);
  process.exit(1);
}
const urlList = [...(await res0.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
if (!urlList.length) {
  console.log('✗ sitemap 里没有 URL');
  process.exit(1);
}

const body = {
  host: HOST,
  key: KEY,
  keyLocation: `${SITE}/${KEY}.txt`,
  urlList: urlList.slice(0, 10000), // IndexNow 单次上限
};

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(body),
});
console.log(`IndexNow: HTTP ${res.status} ${res.statusText} · 提交 ${body.urlList.length} 条 URL`);
if (res.status === 200 || res.status === 202) {
  console.log('✓ 已受理');
} else {
  console.log(`✗ 未受理${res.status === 403 ? '（key 校验失败：检查 ${SITE}/${KEY}.txt 是否可访问）' : ''}`);
  console.log((await res.text().catch(() => '')).slice(0, 400));
  process.exit(1);
}
