// 빌드 결과(dist) 점검: 본문 글자 수, FAQ 수, 광고 슬롯, 내부 링크 깨짐, 필수 메타 태그
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const files = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (f.endsWith('.html')) files.push(p);
  }
})(dist);

const strip = (h) => h.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ');
let problems = 0;
for (const file of files) {
  const html = readFileSync(file, 'utf8');
  const rel = file.slice(dist.length).split(sep).join('/');
  const issues = [];
  for (const tag of ['<title>', 'name="description"', 'rel="canonical"', 'property="og:title"', 'lang="ko"']) {
    if (!html.includes(tag) && !rel.startsWith('404')) issues.push(`missing ${tag}`);
  }
  for (const m of html.matchAll(/href="(\/[^"#?]*)/g)) {
    let p = m[1];
    const target = p.endsWith('/') ? join(dist, p, 'index.html') : join(dist, p);
    if (!existsSync(target) && !existsSync(join(dist, p))) issues.push(`broken link ${p}`);
  }
  const imgs = [...html.matchAll(/<img\b[^>]*>/g)].filter((m) => !/\balt=/.test(m[0]));
  if (imgs.length) issues.push(`${imgs.length} img without alt`);
  const art = html.match(/<article class="prose-ko[^"]*"[^>]*>([\s\S]*?)<\/article>/);
  let info = '';
  if (art) {
    const chars = strip(art[1]).replace(/\s+/g, '').length;
    const faqs = (html.match(/<details class="group/g) || []).length;
    const ads = (html.match(/class="ad-slot/g) || []).length;
    const ld = [...html.matchAll(/"@type":"(WebApplication|FAQPage|BreadcrumbList)"/g)].map((m) => m[1]);
    info = `본문 ${chars}자(공백 제외), FAQ ${faqs}, 광고 ${ads}, JSON-LD ${[...new Set(ld)].join('+')}`;
    if (chars < 1500) issues.push('본문 1,500자 미만');
    if (faqs < 5) issues.push('FAQ 5개 미만');
    if (ads !== 3) issues.push('광고 슬롯 3개 아님');
    if (new Set(ld).size < 3) issues.push('JSON-LD 누락');
  }
  problems += issues.length;
  console.log(`${issues.length ? '✗' : '✓'} ${rel} ${info}${issues.length ? '\n    - ' + [...new Set(issues)].join('\n    - ') : ''}`);
}
console.log(problems ? `\n문제 ${problems}건` : '\n문제 없음');
process.exitCode = problems ? 1 : 0;
