const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const { createApp } = require('../server/app');
const { createStore } = require('../server/store');
const { build } = require('../server/publish');

const ROOT = path.join(__dirname, '..');
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

function request(base, { method = 'GET', path: pathname = '/', body, cookie, headers = {} }) {
  return new Promise((resolve, reject) => {
    const payload = body && !Buffer.isBuffer(body) && typeof body !== 'string' ? Buffer.from(JSON.stringify(body)) : body;
    const req = http.request(base + pathname, {
      method,
      headers: {
        ...(payload && !headers['Content-Type'] ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...(payload && headers['Content-Type'] ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...(cookie ? { Cookie: cookie } : {}),
        ...headers
      }
    }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8');
        let json = null;
        try { json = JSON.parse(text); } catch { /* html or js */ }
        resolve({ status: res.statusCode, headers: res.headers, text, json });
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function cookieFrom(response) {
  const raw = response.headers['set-cookie'] || [];
  const first = Array.isArray(raw) ? raw[0] : raw;
  return String(first || '').split(';')[0];
}

test('API、鉴权、内容发布与静态构建', async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'jr-cms-'));
  const contentDir = path.join(dir, 'content');
  const uploadDir = path.join(dir, 'uploads');
  const generatedDir = path.join(dir, 'generated');
  const distDir = path.join(dir, 'dist');
  const { app } = createApp({
    contentDir,
    uploadDir,
    generatedDir,
    seedDir: path.join(ROOT, 'content'),
    sessionSecret: 'test-secret-value-123456',
    syncRoot: false,
    env: { ADMIN_USERNAME: 'admin', ADMIN_PASSWORD: 'junrong-admin' }
  });
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  const adminHeaders = { 'X-Requested-With': 'JRAdmin' };
  let cookie = '';

  t.after(() => new Promise((resolve) => server.close(resolve)));

  await t.test('健康检查与原稿规模', async () => {
    const health = await request(base, { path: '/api/health' });
    assert.equal(health.status, 200);
    assert.equal(health.json.ok, true);
    const content = await request(base, { path: '/api/public/content' });
    assert.equal(content.json.catalog.products.length, 30);
    assert.equal(content.json.catalog.categories.length, 6);
    assert.equal(content.json.catalog.colors.length, 10);
    assert.equal(content.json.clients.brands.length, 14);
    const hotels = content.json.clients.regions.reduce((sum, region) => sum + region.hotels.length, 0);
    assert.equal(hotels, 112);
    assert.equal(content.json.catalog.products[0].name, '纯棉贡缎床品套件');
    assert.match(content.json.site.home.heroTitleHtml, /织就舒适/);
  });

  await t.test('未登录不能进入后台，登录失败与成功', async () => {
    const denied = await request(base, { path: '/api/admin/bootstrap', headers: adminHeaders });
    assert.equal(denied.status, 401);
    const missingHeader = await request(base, { method: 'POST', path: '/api/auth/login', body: { username: 'admin', password: 'junrong-admin' } });
    assert.equal(missingHeader.status, 403);
    const bad = await request(base, { method: 'POST', path: '/api/auth/login', headers: adminHeaders, body: { username: 'admin', password: 'wrong-password' } });
    assert.equal(bad.status, 401);
    const ok = await request(base, { method: 'POST', path: '/api/auth/login', headers: adminHeaders, body: { username: 'admin', password: 'junrong-admin' } });
    assert.equal(ok.status, 200);
    assert.equal(ok.json.user.username, 'admin');
    cookie = cookieFrom(ok);
    assert.match(cookie, /^jr_session=/);
    const me = await request(base, { path: '/api/auth/me', cookie });
    assert.equal(me.json.username, 'admin');
  });

  await t.test('页面文案可保存并出现在生成的网站文件中', async () => {
    const boot = await request(base, { path: '/api/admin/bootstrap', cookie, headers: adminHeaders });
    const chrome = { ...boot.json.site.chrome, footerCompany: '测试君荣纺织' };
    const saved = await request(base, { method: 'PUT', path: '/api/admin/site/chrome', cookie, headers: adminHeaders, body: chrome });
    assert.equal(saved.status, 200);
    assert.equal(saved.json.section.footerCompany, '测试君荣纺织');
    const home = await request(base, { path: '/index.html' });
    assert.equal(home.status, 200);
    assert.match(home.text, /测试君荣纺织/);
    const copy = await request(base, { path: '/site-content.js' });
    assert.match(copy.text, /测试君荣纺织/);
    assert.match(copy.text, /织就舒适/);
    const invalid = await request(base, { method: 'PUT', path: '/api/admin/site/seo', cookie, headers: adminHeaders, body: { title: '只有标题' } });
    assert.equal(invalid.status, 400);
  });

  await t.test('产品校验、创建，以及仍被使用的分类不能删除', async () => {
    const bad = await request(base, { method: 'POST', path: '/api/admin/products', cookie, headers: adminHeaders, body: { id: 'Bad ID', name: '' } });
    assert.equal(bad.status, 400);
    const created = await request(base, { method: 'POST', path: '/api/admin/products', cookie, headers: adminHeaders, body: {
      id: 'bath-9', category: 'bath', name: '测试浴巾', image: 'bath-1', unit: '条', material: '棉类',
      intro: '用于测试的浴巾。', options: ['常规规格'], optionLabel: '规格需求', color: '沙色', colorId: 'sand', sort: 99, enabled: true
    } });
    assert.equal(created.status, 200);
    const dataJs = await request(base, { path: '/data.js' });
    assert.match(dataJs.text, /测试浴巾/);
    const blocked = await request(base, { method: 'DELETE', path: '/api/admin/categories/bed', cookie, headers: adminHeaders });
    assert.equal(blocked.status, 400);
    const removed = await request(base, { method: 'DELETE', path: '/api/admin/products/bath-9', cookie, headers: adminHeaders });
    assert.equal(removed.status, 200);
    const boot = await request(base, { path: '/api/admin/bootstrap', cookie, headers: adminHeaders });
    const bed = boot.json.catalog.categories.find((item) => item.id === 'bed');
    const hidden = await request(base, { method: 'PUT', path: '/api/admin/categories/bed', cookie, headers: adminHeaders, body: { ...bed, enabled: false } });
    assert.equal(hidden.status, 200);
    const after = await request(base, { path: '/api/public/content' });
    assert.equal(after.json.catalog.categories.some((item) => item.id === 'bed'), false);
    assert.equal(after.json.catalog.products.some((item) => item.category === 'bed'), false);
    const restored = await request(base, { method: 'PUT', path: '/api/admin/categories/bed', cookie, headers: adminHeaders, body: { ...bed, enabled: true } });
    assert.equal(restored.status, 200);
  });

  await t.test('配色、方案引用和排序', async () => {
    const color = await request(base, { method: 'POST', path: '/api/admin/colors', cookie, headers: adminHeaders, body: { id: 'testgold', name: '测试金', hex: '#c4a35a', use: '测试', sort: 20 } });
    assert.equal(color.status, 200);
    const scene = await request(base, { method: 'POST', path: '/api/admin/scenes', cookie, headers: adminHeaders, body: {
      id: 'test-scene', name: '测试方案', image: 'scene-business', title: '测试标题', desc: '测试说明',
      focus: ['统一规格'], selection: ['missing-product'], brief: '测试', palette: '暖灰', sort: 9, enabled: true
    } });
    assert.equal(scene.status, 400);
    const boot = await request(base, { path: '/api/admin/bootstrap', cookie, headers: adminHeaders });
    const ids = boot.json.catalog.colors.map((item) => item.id).reverse();
    const ordered = await request(base, { method: 'POST', path: '/api/admin/reorder', cookie, headers: adminHeaders, body: { collection: 'colors', ids } });
    assert.equal(ordered.status, 200);
    const again = await request(base, { path: '/api/admin/bootstrap', cookie, headers: adminHeaders });
    assert.deepEqual(again.json.catalog.colors.map((item) => item.id), ids);
    const duplicate = await request(base, { method: 'POST', path: '/api/admin/reorder', cookie, headers: adminHeaders, body: { collection: 'colors', ids: ids.map((id, index) => index ? id : ids[1]) } });
    assert.equal(duplicate.status, 400);
    await request(base, { method: 'DELETE', path: '/api/admin/colors/testgold', cookie, headers: adminHeaders });
  });

  await t.test('公开询盘会入库，缺字段会被拒绝', async () => {
    const bad = await request(base, { method: 'POST', path: '/api/public/inquiries', body: { organization: '酒店' } });
    assert.equal(bad.status, 400);
    const ok = await request(base, { method: 'POST', path: '/api/public/inquiries', body: {
      organization: '测试酒店', contact: '张三', phone: '13800001111', projectType: '商务酒店',
      rooms: 12, delivery: '2026-12-01', notes: '需要床品',
      items: [{ id: 'bed-1', name: '纯棉贡缎床品套件', option: '1.8m床 / 鼠尾草绿', qty: 2, unit: '套', intent: '采购' }]
    } });
    assert.equal(ok.status, 201);
    const list = await request(base, { path: '/api/admin/inquiries', cookie, headers: adminHeaders });
    assert.equal(list.json[0].organization, '测试酒店');
    assert.equal(list.json[0].items[0].qty, 2);
  });

  await t.test('图片上传只接受真实图片', async () => {
    const boundary = '----jrboundary';
    const badBody = Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="note.txt"\r\nContent-Type: text/plain\r\n\r\nhello\r\n--${boundary}--\r\n`
    );
    const bad = await request(base, {
      method: 'POST', path: '/api/admin/media', cookie,
      headers: { ...adminHeaders, 'Content-Type': 'multipart/form-data; boundary=' + boundary },
      body: badBody
    });
    assert.equal(bad.status, 400);
    const chunks = [
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="alt"\r\n\r\n测试图\r\n`),
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="dot.png"\r\nContent-Type: image/png\r\n\r\n`),
      PNG,
      Buffer.from(`\r\n--${boundary}--\r\n`)
    ];
    const good = await request(base, {
      method: 'POST', path: '/api/admin/media', cookie,
      headers: { ...adminHeaders, 'Content-Type': 'multipart/form-data; boundary=' + boundary },
      body: Buffer.concat(chunks)
    });
    assert.equal(good.status, 200, good.text);
    assert.match(good.json.media.path, /^uploads\/.+\.png$/);
    const file = await request(base, { path: '/' + good.json.media.path });
    assert.equal(file.status, 200);
    assert.equal(file.headers['content-type'], 'image/png');
  });

  await t.test('后台页面可打开，内容数据文件不对外', async () => {
    const admin = await request(base, { path: '/admin' });
    assert.equal(admin.status, 200);
    assert.match(admin.text, /内容管理/);
    const hidden = await request(base, { path: '/content/site.json' });
    assert.equal(hidden.status, 404);
    const styles = await request(base, { path: '/styles.css' });
    assert.equal(styles.status, 200);
    assert.match(styles.text, /--paper/);
  });

  await t.test('静态构建产物包含原稿且不包含后台', async () => {
    const store = createStore(path.join(ROOT, 'content'));
    build({ store, outDir: distDir, mode: 'static', copyStatic: true });
    const index = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
    const data = fs.readFileSync(path.join(distDir, 'data.js'), 'utf8');
    const runtime = fs.readFileSync(path.join(distDir, 'runtime.js'), 'utf8');
    assert.match(index, /君荣纺织 JUNRONG/);
    assert.match(data, /纯棉贡缎床品套件/);
    assert.match(runtime, /"inquiryEndpoint": null/);
    assert.equal(fs.existsSync(path.join(distDir, 'admin', 'index.html')), false);
    assert.equal(fs.existsSync(path.join(distDir, 'assets', 'hero.webp')), true);
    assert.equal(fs.existsSync(path.join(distDir, 'app.js')), true);
  });
});
