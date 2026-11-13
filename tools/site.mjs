// 站点基址的唯一来源。
//
// 默认是 GitHub Pages；换托管（Cloudflare Pages / 自有域名 / 预览环境）时
// 只需要设环境变量，不用改任何代码：
//
//   SITE_BASE=https://autonomous-data-loop.pages.dev npm run build && npm run site
//
// 约定：不带结尾斜杠。
export const DEFAULT_SITE = 'https://peng456.github.io/autonomous-data-loop';

export const SITE = (process.env.SITE_BASE || DEFAULT_SITE).replace(/\/+$/, '');

/** 站点基址是否被覆盖过（决定 index.html 是否需要重写） */
export const SITE_OVERRIDDEN = SITE !== DEFAULT_SITE;
