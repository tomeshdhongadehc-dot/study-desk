// Builds two outputs from the readable source (study-desk.html):
//   build/study-desk.min.html  -> published as the claude.ai artifact (page body only)
//   ../site/                   -> static Vercel site (full document + tasks.json + vercel.json)
const fs = require('fs'), path = require('path'), esbuild = require('esbuild');
const SRC = path.join(__dirname, 'study-desk.html');
const OUT_ART = path.join(__dirname, 'build', 'study-desk.min.html');
const OUT_WEB = path.join(__dirname, '..', 'site');

(async () => {
  const src = fs.readFileSync(SRC, 'utf8');
  const cssA = src.indexOf('<style>'), cssB = src.indexOf('</style>');
  const jsA = src.indexOf('<script>'), jsB = src.lastIndexOf('</script>');
  const head = src.slice(0, cssA);                      // <title> + font links
  const css = src.slice(cssA + 7, cssB);
  const markup = src.slice(cssB + 8, jsA);
  const js = src.slice(jsA + 8, jsB);

  const minCss = (await esbuild.transform(css, { loader: 'css', minify: true, target: ['chrome100', 'safari15', 'firefox100'] })).code.trim();
  const minJs = (await esbuild.transform(js, { loader: 'js', minify: true, target: 'es2020', legalComments: 'none' })).code.trim();
  const minMarkup = markup.replace(/<!--[\s\S]*?-->/g, '').replace(/>\s+</g, '><').trim();
  const minHead = head.replace(/>\s+</g, '><').trim();

  const body = `${minHead}<style>${minCss}</style>${minMarkup}<script>${minJs}</script>`;
  fs.mkdirSync(path.dirname(OUT_ART), { recursive: true });
  fs.writeFileSync(OUT_ART, body);

  // Vercel: real <head>, preload the task list so it downloads alongside the page
  const favicon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23FFC857'/%3E%3Cstop offset='.5' stop-color='%23FF7A45'/%3E%3Cstop offset='1' stop-color='%23E8459B'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='64' height='64' rx='18' fill='url(%23g)'/%3E%3Cpath d='M18 33l9 9 19-20' fill='none' stroke='%231A0B14' stroke-width='7' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";
  const tasks = JSON.parse(fs.readFileSync(path.join(OUT_WEB, 'tasks.json'), 'utf8'));
  const seed = JSON.stringify(tasks).replace(/</g, '<');
  const web = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">`
    + `<meta name="theme-color" content="#0A0918" media="(prefers-color-scheme: dark)"><meta name="theme-color" content="#F3F0FA" media="(prefers-color-scheme: light)">`
    + `<meta name="description" content="Daily system-design study quests with XP, streaks and a focus timer.">`
    + `<link rel="icon" href="${favicon}">`
    + `${minHead}<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}[hidden]{display:none!important}${minCss}</style></head>`
    + `<body>${minMarkup}<script id="seed-tasks" type="application/json">${seed}</script><script>${minJs}</script></body></html>`;
  fs.writeFileSync(path.join(OUT_WEB, 'index.html'), web);

  fs.writeFileSync(path.join(OUT_WEB, 'tasks.json'), JSON.stringify(tasks));

  fs.writeFileSync(path.join(OUT_WEB, 'vercel.json'), JSON.stringify({
    headers: [
      { source: '/', headers: [{ key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }] },
      { source: '/index.html', headers: [{ key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }] },
      { source: '/tasks.json', headers: [{ key: 'Cache-Control', value: 'public, max-age=300, stale-while-revalidate=86400' }] },
    ],
  }, null, 2));

  const kb = p => (fs.statSync(p).size / 1024).toFixed(1) + ' KB';
  console.log('source', kb(SRC), '| artifact', kb(OUT_ART), '| vercel index', kb(path.join(OUT_WEB, 'index.html')), '| tasks.json', kb(path.join(OUT_WEB, 'tasks.json')));
  const zlib = require('zlib');
  console.log('vercel index gzipped', (zlib.gzipSync(web).length / 1024).toFixed(1) + ' KB');
})().catch(e => { console.error(e); process.exit(1); });
