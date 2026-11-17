const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function bySort(list) {
  return [...list].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0) || String(a.id || '').localeCompare(String(b.id || '')));
}

function embed(globalName, value) {
  const json = JSON.stringify(value, null, 2)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
  return 'window.' + globalName + ' = ' + json + ';\n';
}

function publicCatalog(catalog) {
  const categories = bySort(catalog.categories).filter((item) => item.enabled !== false).map((item) => ({
    id: item.id, name: item.name, en: item.en, image: item.image, description: item.description
  }));
  const visibleCategories = new Set(categories.map((item) => item.id));
  const products = bySort(catalog.products).filter((item) => item.enabled !== false && visibleCategories.has(item.category)).map((item) => ({
    id: item.id, category: item.category, name: item.name, image: item.image, unit: item.unit,
    material: item.material, intro: item.intro, options: item.options, optionLabel: item.optionLabel,
    color: item.color, colorId: item.colorId
  }));
  const colors = bySort(catalog.colors).map((item) => ({
    id: item.id, name: item.name, hex: item.hex, use: item.use
  }));
  const scenes = bySort(catalog.scenes).filter((item) => item.enabled !== false).map((item) => ({
    id: item.id, name: item.name, image: item.image, title: item.title, desc: item.desc,
    focus: item.focus, selection: item.selection, brief: item.brief, palette: item.palette
  }));
  return { categories, products, colors, scenes };
}

function publicClients(clients) {
  const brands = bySort(clients.brands).map((item) => {
    const row = { name: item.name };
    if (item.logo) {
      row.logo = item.logo;
      if (item.ar) row.ar = item.ar;
    }
    row.cn = item.cn;
    return row;
  });
  const landmarks = bySort(clients.landmarks).map((item) => ({
    name: item.name, en: item.en, city: item.city
  }));
  const regions = bySort(clients.regions).map((item) => ({
    id: item.id,
    name: item.name,
    hotels: item.hotels.map((hotel) => [hotel.name, hotel.stars])
  }));
  return { source: clients.source, brands, landmarks, regions };
}

function replaceBlock(html, name, inner) {
  const pattern = new RegExp('<!-- cms:' + name + ' -->[\\s\\S]*?<!-- /cms:' + name + ' -->');
  if (!pattern.test(html)) throw new Error('index.html 缺少标记 cms:' + name);
  return html.replace(pattern, '<!-- cms:' + name + ' -->\n' + inner + '\n<!-- /cms:' + name + ' -->');
}

function renderIndex(site) {
  const template = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const nav = site.chrome.navigation.map((item) =>
    '      <a href="' + escapeAttr(item.href) + '" data-nav="' + escapeAttr(item.id) + '">' + escapeText(item.label) + '</a>'
  ).join('\n');
  const mobile = site.chrome.navigation.map((item) =>
    '<a href="' + escapeAttr(item.href) + '">' + escapeText(item.label) + '</a>'
  ).join('') + '<a href="#/inquiry">' + escapeText(site.chrome.headerCta) + '</a>';
  const footerLinks = site.chrome.footerLinks.map((item) =>
    '<a href="' + escapeAttr(item.href) + '">' + escapeText(item.label) + '</a>'
  ).join('');
  const contact = [site.contact.phone, site.contact.email, site.contact.address, site.contact.hours].filter(Boolean);
  const contactHtml = contact.length ? '<span data-contact>' + escapeText(contact.join(' · ')) + '</span>' : '';
  let html = template;
  html = replaceBlock(html, 'head',
    '  <meta name="description" content="' + escapeAttr(site.seo.description) + '">\n' +
    '  <meta name="theme-color" content="' + escapeAttr(site.seo.themeColor) + '">\n' +
    '  <title>' + escapeText(site.seo.title) + '</title>'
  );
  html = replaceBlock(html, 'nav', nav);
  html = replaceBlock(html, 'mobilenav', '  <nav class="mobile-nav" aria-label="移动端导航" hidden>' + mobile + '</nav>');
  html = replaceBlock(html, 'footer',
    '    <div class="footer-top"><a class="footer-brand" href="#/" aria-label="君荣纺织首页"><img src="assets/brand/junrong-logo.svg?v=1" alt="JUNRONG 君荣纺织 · ' + escapeAttr(site.chrome.footerCompany) + '" width="930" height="309"></a><p>' + richHtml(site.chrome.footerTaglineHtml) + '</p><div>' + footerLinks + '</div></div>\n' +
    '    <div class="footer-bottom"><span>' + escapeText(site.chrome.footerCompany) + '</span><span>' + escapeText(site.chrome.footerCopyright) + '</span><span>' + escapeText(site.chrome.footerDisclaimer) + '</span>' + contactHtml + '</div>'
  );
  html = html.replace('class="quote-nav" href="#/inquiry">询价清单', 'class="quote-nav" href="#/inquiry">' + escapeText(site.chrome.quoteNav));
  html = html.replace('class="button primary desktop-quote" href="#/inquiry">获取报价', 'class="button primary desktop-quote" href="#/inquiry">' + escapeText(site.chrome.headerCta));
  return html;
}

function escapeText(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function richHtml(value) {
  let str = String(value ?? '');
  const tokens = [];
  str = str.replace(/<br\s+class=(["'])mobile-break\1\s*\/?>/gi, () => {
    tokens.push('<br class="mobile-break">');
    return '\u0000' + (tokens.length - 1) + '\u0000';
  }).replace(/<br\s*\/?>/gi, () => {
    tokens.push('<br>');
    return '\u0000' + (tokens.length - 1) + '\u0000';
  });
  str = escapeText(str);
  return str.replace(/\u0000(\d+)\u0000/g, (_, i) => tokens[Number(i)]);
}

function escapeAttr(value) {
  return escapeText(value);
}

function writeGenerated(store, outDir, mode) {
  fs.mkdirSync(outDir, { recursive: true });
  const site = store.read('site');
  const catalog = publicCatalog(store.read('catalog'));
  const clients = publicClients(store.read('clients'));
  fs.writeFileSync(path.join(outDir, 'data.js'), '/* Generated from content/catalog.json. Edit through the admin. */\n' + embed('JR', catalog));
  fs.writeFileSync(path.join(outDir, 'clients.js'), '/* Generated from content/clients.json. Edit through the admin. */\n' + embed('JR_CLIENTS', clients));
  fs.writeFileSync(path.join(outDir, 'site-content.js'), '/* Generated from content/site.json. Edit through the admin. */\n' + embed('JR_COPY', site));
  const runtime = mode === 'server'
    ? { mode: 'server', inquiryEndpoint: 'api/public/inquiries' }
    : { mode: 'static', inquiryEndpoint: null };
  fs.writeFileSync(path.join(outDir, 'runtime.js'), embed('JR_RUNTIME', runtime));
  fs.writeFileSync(path.join(outDir, 'index.html'), renderIndex(site));
  return { site, catalog, clients };
}

const STATIC_FILES = [
  'app.js', 'styles.css', '404.html', 'design-gallery.html', 'image-audit-v2.html',
  'DESIGN-SYSTEM.html', 'README.html', '.nojekyll'
];

function copyStaticSite(outDir) {
  for (const name of STATIC_FILES) {
    const from = path.join(ROOT, name);
    if (fs.existsSync(from)) fs.copyFileSync(from, path.join(outDir, name));
  }
  for (const dir of ['assets', 'concepts', 'previews', 'uploads']) {
    const from = path.join(ROOT, dir);
    if (fs.existsSync(from)) copyDir(from, path.join(outDir, dir));
  }
  const rootHtml = fs.readdirSync(ROOT).filter((name) => name.endsWith('.html') && !STATIC_FILES.includes(name) && name !== 'index.html');
  for (const name of rootHtml) fs.copyFileSync(path.join(ROOT, name), path.join(outDir, name));
}

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    if (entry.name === '.gitkeep') continue;
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(src, dest);
    else if (entry.isFile()) fs.copyFileSync(src, dest);
  }
}

function listLibrary() {
  const found = [];
  function walk(dir, prefix) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const rel = prefix ? prefix + '/' + entry.name : entry.name;
      if (entry.isDirectory()) walk(path.join(dir, entry.name), rel);
      else if (/\.(webp|png|jpe?g|gif|svg)$/i.test(entry.name)) found.push('assets/' + rel);
    }
  }
  walk(path.join(ROOT, 'assets'), '');
  return found.sort();
}

function build({ store, outDir, mode, copyStatic }) {
  const generated = writeGenerated(store, outDir, mode);
  if (copyStatic) copyStaticSite(outDir);
  return generated;
}

module.exports = { build, writeGenerated, publicCatalog, publicClients, renderIndex, listLibrary, ROOT };
