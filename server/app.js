const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const busboy = require('busboy');
const { createStore } = require('./store');
const { HttpError } = require('./errors');
const auth = require('./auth');
const publish = require('./publish');
const validate = require('./validate');

const ROOT = publish.ROOT;

function createApp(options = {}) {
  const contentDir = options.contentDir || path.join(ROOT, 'content');
  const uploadDir = options.uploadDir || path.join(ROOT, 'uploads');
  const generatedDir = options.generatedDir || path.join(ROOT, 'generated');
  const seedDir = options.seedDir || process.env.SEED_DIR || path.join(ROOT, 'content');
  const cookieSecure = options.cookieSecure === true || process.env.COOKIE_SECURE === '1';
  const syncRoot = options.syncRoot === true;
  const trustProxy = process.env.TRUST_PROXY === '1';

  const store = createStore(contentDir);
  store.ensure(seedDir);
  if (!fs.existsSync(path.join(contentDir, 'site.json'))) {
    throw new Error('找不到 content/site.json。空数据卷请设置 SEED_DIR 指向原稿目录。');
  }
  auth.ensureAuth(contentDir, options.env || process.env);
  const sessionSecret = options.sessionSecret || auth.resolveSecret(contentDir);
  fs.mkdirSync(uploadDir, { recursive: true });
  fs.mkdirSync(generatedDir, { recursive: true });

  function publishNow() {
    publish.writeGenerated(store, generatedDir, 'server');
    if (!syncRoot) return;
    for (const name of ['data.js', 'clients.js', 'site-content.js']) {
      fs.copyFileSync(path.join(generatedDir, name), path.join(ROOT, name));
    }
  }
  publishNow();

  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', trustProxy ? 1 : false);
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'same-origin');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    next();
  });
  app.use(express.json({ limit: '1mb' }));

  const loginHits = new Map();
  const inquiryHits = new Map();

  function clientKey(req) {
    if (trustProxy) return req.ip || 'local';
    return (req.socket && req.socket.remoteAddress) || 'local';
  }

  function rateLimit(map, max, windowMs) {
    return (req, res, next) => {
      const key = clientKey(req);
      const now = Date.now();
      const recent = (map.get(key) || []).filter((time) => now - time < windowMs);
      if (recent.length >= max) return next(new HttpError(429, '操作过于频繁，请稍后再试'));
      recent.push(now);
      map.set(key, recent);
      next();
    };
  }

  function readCookie(req, name) {
    const header = req.headers.cookie || '';
    for (const part of header.split(';')) {
      const text = part.trim();
      const eq = text.indexOf('=');
      if (eq === -1) continue;
      if (text.slice(0, eq) === name) return decodeURIComponent(text.slice(eq + 1));
    }
    return '';
  }

  function setSession(res, token) {
    const bits = [
      'jr_session=' + encodeURIComponent(token),
      'HttpOnly',
      'SameSite=Lax',
      'Path=/',
      'Max-Age=' + (token ? Math.floor(auth.SESSION_MS / 1000) : 0)
    ];
    if (cookieSecure) bits.push('Secure');
    res.setHeader('Set-Cookie', bits.join('; '));
  }

  function requireUser(req, res, next) {
    const payload = auth.verifyToken(readCookie(req, 'jr_session'), sessionSecret, auth.tokenVersion(contentDir));
    if (!payload) return next(new HttpError(401, '请先登录'));
    req.user = { username: payload.u, role: payload.role };
    next();
  }

  function requireAdminHeader(req, res, next) {
    if (req.get('x-requested-with') !== 'JRAdmin') return next(new HttpError(403, '拒绝该请求'));
    const origin = req.get('origin');
    if (origin) {
      try {
        if (new URL(origin).host !== req.get('host')) return next(new HttpError(403, '拒绝该请求'));
      } catch {
        return next(new HttpError(403, '拒绝该请求'));
      }
    }
    next();
  }

  function saved(res, body) {
    store.touch();
    publishNow();
    res.json(body);
  }

  function sendGenerated(name, type) {
    return (req, res, next) => {
      const file = path.join(generatedDir, name);
      if (!fs.existsSync(file)) return next();
      res.type(type);
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(file);
    };
  }

  app.get('/api/health', (req, res) => {
    res.json({ ok: true, service: 'junrong-cms' });
  });

  app.get('/api/public/content', (req, res) => {
    res.json({
      site: store.read('site'),
      catalog: publish.publicCatalog(store.read('catalog')),
      clients: publish.publicClients(store.read('clients'))
    });
  });

  app.post('/api/public/inquiries', rateLimit(inquiryHits, 20, 60 * 60 * 1000), (req, res, next) => {
    try {
      const site = store.read('site');
      const cleaned = validate.cleanInquiry(req.body || {}, site.inquiry && site.inquiry.projectTypes);
      const inquiries = store.read('inquiries');
      const row = { id: crypto.randomBytes(8).toString('hex'), createdAt: new Date().toISOString(), status: 'new', ...cleaned };
      inquiries.unshift(row);
      store.write('inquiries', inquiries.slice(0, 1000));
      store.touch();
      res.status(201).json({ ok: true, id: row.id });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/auth/login', rateLimit(loginHits, 8, 15 * 60 * 1000), requireAdminHeader, (req, res, next) => {
    try {
      const username = req.body && typeof req.body.username === 'string' ? req.body.username.trim() : '';
      const password = req.body && typeof req.body.password === 'string' ? req.body.password : '';
      if (!username || !password) throw new HttpError(400, '请填写用户名和密码');
      const result = auth.login(contentDir, username, password, sessionSecret);
      setSession(res, result.token);
      res.json({ ok: true, user: result.user });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/auth/logout', requireAdminHeader, (req, res) => {
    setSession(res, '');
    res.json({ ok: true });
  });

  app.get('/api/auth/me', (req, res) => {
    const payload = auth.verifyToken(readCookie(req, 'jr_session'), sessionSecret, auth.tokenVersion(contentDir));
    if (!payload) return res.status(401).json({ error: '请先登录' });
    res.json({ username: payload.u, role: payload.role });
  });

  const admin = express.Router();
  admin.use(requireUser, requireAdminHeader);

  admin.get('/schema', (req, res) => {
    res.json(validate.describeForAdmin());
  });

  admin.get('/bootstrap', (req, res) => {
    const meta = store.read('meta');
    res.json({
      user: req.user,
      site: store.read('site'),
      catalog: store.read('catalog'),
      clients: store.read('clients'),
      media: store.read('media'),
      inquiries: store.read('inquiries'),
      library: publish.listLibrary(),
      updatedAt: meta.updatedAt
    });
  });

  admin.put('/site/:section', (req, res, next) => {
    try {
      const section = req.params.section;
      const cleaned = validate.cleanSection(section, req.body || {});
      const site = store.read('site');
      site[section] = cleaned;
      store.write('site', site);
      saved(res, { ok: true, section: cleaned });
    } catch (error) {
      next(error);
    }
  });

  admin.put('/password', (req, res, next) => {
    try {
      const body = validate.cleanPassword(req.body || {});
      const version = auth.changePassword(contentDir, req.user.username, body.currentPassword, body.newPassword);
      const token = auth.sign({
        u: req.user.username,
        role: req.user.role,
        v: version,
        exp: Date.now() + auth.SESSION_MS
      }, sessionSecret);
      setSession(res, token);
      res.json({ ok: true });
    } catch (error) {
      next(error);
    }
  });

  function catalogMutate(res, next, change) {
    try {
      const catalog = store.read('catalog');
      const result = change(catalog);
      store.write('catalog', catalog);
      saved(res, result);
    } catch (error) {
      next(error);
    }
  }

  function clientsMutate(res, next, change) {
    try {
      const clients = store.read('clients');
      const result = change(clients);
      store.write('clients', clients);
      saved(res, result);
    } catch (error) {
      next(error);
    }
  }

  admin.post('/categories', (req, res, next) => catalogMutate(res, next, (catalog) => {
    const row = validate.cleanCategory(req.body || {});
    if (catalog.categories.some((item) => item.id === row.id)) throw new HttpError(409, '分类标识已存在');
    catalog.categories.push(row);
    return { ok: true, category: row };
  }));

  admin.put('/categories/:id', (req, res, next) => catalogMutate(res, next, (catalog) => {
    const current = catalog.categories.find((item) => item.id === req.params.id);
    if (!current) throw new HttpError(404, '未找到分类');
    const row = validate.cleanCategory({ ...req.body, id: req.params.id });
    Object.assign(current, row);
    return { ok: true, category: current };
  }));

  admin.delete('/categories/:id', (req, res, next) => catalogMutate(res, next, (catalog) => {
    if (catalog.products.some((item) => item.category === req.params.id)) {
      throw new HttpError(400, '该分类下仍有产品，请先调整产品');
    }
    const before = catalog.categories.length;
    catalog.categories = catalog.categories.filter((item) => item.id !== req.params.id);
    if (catalog.categories.length === before) throw new HttpError(404, '未找到分类');
    return { ok: true };
  }));

  admin.post('/products', (req, res, next) => catalogMutate(res, next, (catalog) => {
    const row = validate.cleanProduct(req.body || {});
    assertRefs(catalog, row);
    if (catalog.products.some((item) => item.id === row.id)) throw new HttpError(409, '产品标识已存在');
    catalog.products.push(row);
    return { ok: true, product: row };
  }));

  admin.put('/products/:id', (req, res, next) => catalogMutate(res, next, (catalog) => {
    const current = catalog.products.find((item) => item.id === req.params.id);
    if (!current) throw new HttpError(404, '未找到产品');
    const row = validate.cleanProduct({ ...req.body, id: req.params.id });
    assertRefs(catalog, row);
    Object.assign(current, row);
    return { ok: true, product: current };
  }));

  admin.delete('/products/:id', (req, res, next) => catalogMutate(res, next, (catalog) => {
    if (catalog.scenes.some((scene) => scene.selection.includes(req.params.id))) {
      throw new HttpError(400, '配套方案仍在使用该产品');
    }
    const before = catalog.products.length;
    catalog.products = catalog.products.filter((item) => item.id !== req.params.id);
    if (catalog.products.length === before) throw new HttpError(404, '未找到产品');
    return { ok: true };
  }));

  admin.post('/colors', (req, res, next) => catalogMutate(res, next, (catalog) => {
    const row = validate.cleanColor(req.body || {});
    if (catalog.colors.some((item) => item.id === row.id)) throw new HttpError(409, '配色标识已存在');
    catalog.colors.push(row);
    return { ok: true, color: row };
  }));

  admin.put('/colors/:id', (req, res, next) => catalogMutate(res, next, (catalog) => {
    const current = catalog.colors.find((item) => item.id === req.params.id);
    if (!current) throw new HttpError(404, '未找到配色');
    const row = validate.cleanColor({ ...req.body, id: req.params.id });
    Object.assign(current, row);
    for (const product of catalog.products) {
      if (product.colorId === row.id) product.color = row.name;
    }
    return { ok: true, color: current };
  }));

  admin.delete('/colors/:id', (req, res, next) => catalogMutate(res, next, (catalog) => {
    if (catalog.products.some((item) => item.colorId === req.params.id)) {
      throw new HttpError(400, '仍有产品使用该配色');
    }
    const before = catalog.colors.length;
    catalog.colors = catalog.colors.filter((item) => item.id !== req.params.id);
    if (catalog.colors.length === before) throw new HttpError(404, '未找到配色');
    return { ok: true };
  }));

  admin.post('/scenes', (req, res, next) => catalogMutate(res, next, (catalog) => {
    const row = validate.cleanScene(req.body || {});
    assertSelection(catalog, row.selection);
    if (catalog.scenes.some((item) => item.id === row.id)) throw new HttpError(409, '方案标识已存在');
    catalog.scenes.push(row);
    return { ok: true, scene: row };
  }));

  admin.put('/scenes/:id', (req, res, next) => catalogMutate(res, next, (catalog) => {
    const current = catalog.scenes.find((item) => item.id === req.params.id);
    if (!current) throw new HttpError(404, '未找到方案');
    const row = validate.cleanScene({ ...req.body, id: req.params.id });
    assertSelection(catalog, row.selection);
    Object.assign(current, row);
    return { ok: true, scene: current };
  }));

  admin.delete('/scenes/:id', (req, res, next) => catalogMutate(res, next, (catalog) => {
    const before = catalog.scenes.length;
    catalog.scenes = catalog.scenes.filter((item) => item.id !== req.params.id);
    if (catalog.scenes.length === before) throw new HttpError(404, '未找到方案');
    return { ok: true };
  }));

  admin.post('/reorder', (req, res, next) => {
    try {
      const collection = req.body && req.body.collection;
      const ids = req.body && req.body.ids;
      const catalogKeys = { categories: 'catalog', products: 'catalog', colors: 'catalog', scenes: 'catalog' };
      const clientKeys = { brands: 'clients', landmarks: 'clients', regions: 'clients' };
      const file = catalogKeys[collection] || clientKeys[collection];
      if (!file || !Array.isArray(ids)) throw new HttpError(400, '排序参数不正确');
      if (new Set(ids).size !== ids.length) throw new HttpError(400, '排序列表有重复项');
      const data = store.read(file);
      const list = data[collection];
      if (!Array.isArray(list) || ids.length !== list.length) throw new HttpError(400, '排序列表不完整');
      const map = new Map(list.map((item) => [item.id, item]));
      if (ids.some((id) => !map.has(id))) throw new HttpError(400, '排序列表不完整');
      data[collection] = ids.map((id, index) => ({ ...map.get(id), sort: index }));
      store.write(file, data);
      saved(res, { ok: true });
    } catch (error) {
      next(error);
    }
  });

  admin.put('/clients/source', (req, res, next) => clientsMutate(res, next, (clients) => {
    const source = req.body && typeof req.body.source === 'string' ? req.body.source.trim() : '';
    if (!source || source.length > 120) throw new HttpError(400, '请填写名录来源说明');
    clients.source = source;
    return { ok: true, source };
  }));

  admin.post('/brands', (req, res, next) => clientsMutate(res, next, (clients) => {
    const row = validate.cleanBrand(req.body || {});
    if (clients.brands.some((item) => item.id === row.id)) throw new HttpError(409, '品牌标识已存在');
    clients.brands.push(row);
    return { ok: true, brand: row };
  }));

  admin.put('/brands/:id', (req, res, next) => clientsMutate(res, next, (clients) => {
    const current = clients.brands.find((item) => item.id === req.params.id);
    if (!current) throw new HttpError(404, '未找到品牌');
    Object.assign(current, validate.cleanBrand({ ...req.body, id: req.params.id }));
    return { ok: true, brand: current };
  }));

  admin.delete('/brands/:id', (req, res, next) => clientsMutate(res, next, (clients) => {
    const before = clients.brands.length;
    clients.brands = clients.brands.filter((item) => item.id !== req.params.id);
    if (clients.brands.length === before) throw new HttpError(404, '未找到品牌');
    return { ok: true };
  }));

  admin.post('/landmarks', (req, res, next) => clientsMutate(res, next, (clients) => {
    const row = validate.cleanLandmark(req.body || {});
    if (clients.landmarks.some((item) => item.id === row.id)) throw new HttpError(409, '酒店标识已存在');
    clients.landmarks.push(row);
    return { ok: true, landmark: row };
  }));

  admin.put('/landmarks/:id', (req, res, next) => clientsMutate(res, next, (clients) => {
    const current = clients.landmarks.find((item) => item.id === req.params.id);
    if (!current) throw new HttpError(404, '未找到酒店');
    Object.assign(current, validate.cleanLandmark({ ...req.body, id: req.params.id }));
    return { ok: true, landmark: current };
  }));

  admin.delete('/landmarks/:id', (req, res, next) => clientsMutate(res, next, (clients) => {
    const before = clients.landmarks.length;
    clients.landmarks = clients.landmarks.filter((item) => item.id !== req.params.id);
    if (clients.landmarks.length === before) throw new HttpError(404, '未找到酒店');
    return { ok: true };
  }));

  admin.post('/regions', (req, res, next) => clientsMutate(res, next, (clients) => {
    const row = validate.cleanRegion(req.body || {});
    if (clients.regions.some((item) => item.id === row.id)) throw new HttpError(409, '地区标识已存在');
    clients.regions.push(row);
    return { ok: true, region: row };
  }));

  admin.put('/regions/:id', (req, res, next) => clientsMutate(res, next, (clients) => {
    const current = clients.regions.find((item) => item.id === req.params.id);
    if (!current) throw new HttpError(404, '未找到地区');
    const row = validate.cleanRegion({ ...req.body, id: req.params.id });
    Object.assign(current, row);
    return { ok: true, region: current };
  }));

  admin.delete('/regions/:id', (req, res, next) => clientsMutate(res, next, (clients) => {
    const before = clients.regions.length;
    clients.regions = clients.regions.filter((item) => item.id !== req.params.id);
    if (clients.regions.length === before) throw new HttpError(404, '未找到地区');
    return { ok: true };
  }));

  admin.get('/inquiries', (req, res) => {
    res.json(store.read('inquiries'));
  });

  admin.delete('/inquiries/:id', (req, res, next) => {
    try {
      const inquiries = store.read('inquiries').filter((item) => item.id !== req.params.id);
      if (inquiries.length === store.read('inquiries').length) throw new HttpError(404, '未找到询盘');
      store.write('inquiries', inquiries);
      saved(res, { ok: true });
    } catch (error) {
      next(error);
    }
  });

  admin.post('/media', (req, res, next) => {
    if (!String(req.headers['content-type'] || '').includes('multipart/form-data')) {
      return next(new HttpError(400, '请使用表单上传图片'));
    }
    let parser;
    try {
      parser = busboy({
        headers: req.headers,
        limits: { files: 1, fileSize: 8 * 1024 * 1024, fields: 4, fieldSize: 500 }
      });
    } catch {
      return next(new HttpError(400, '上传格式不正确'));
    }
    const chunks = [];
    let limited = false;
    let sawFile = false;
    let alt = '';
    let settled = false;
    parser.on('field', (name, value) => {
      if (name === 'alt') alt = String(value || '').slice(0, 120);
    });
    parser.on('file', (name, file) => {
      sawFile = true;
      file.on('limit', () => { limited = true; file.resume(); });
      file.on('data', (chunk) => { if (!limited) chunks.push(chunk); });
    });
    parser.on('error', () => {
      if (!settled) {
        settled = true;
        next(new HttpError(400, '上传失败'));
      }
    });
    parser.on('close', () => {
      if (settled) return;
      settled = true;
      try {
        if (!sawFile) throw new HttpError(400, '请选择图片文件');
        if (limited) throw new HttpError(400, '图片不能超过 8MB');
        const buf = Buffer.concat(chunks);
        const kind = sniff(buf);
        if (!kind) throw new HttpError(400, '只支持 JPG、PNG、WEBP 或 GIF');
        const filename = Date.now().toString(36) + '-' + crypto.randomBytes(4).toString('hex') + '.' + kind.ext;
        fs.writeFileSync(path.join(uploadDir, filename), buf);
        const row = {
          id: path.parse(filename).name,
          path: 'uploads/' + filename,
          alt: alt.trim(),
          bytes: buf.length,
          createdAt: new Date().toISOString()
        };
        const media = store.read('media');
        media.unshift(row);
        store.write('media', media);
        saved(res, { ok: true, media: row });
      } catch (error) {
        next(error);
      }
    });
    req.pipe(parser);
  });

  admin.delete('/media/:id', (req, res, next) => {
    try {
      const media = store.read('media');
      const row = media.find((item) => item.id === req.params.id);
      if (!row) throw new HttpError(404, '未找到文件');
      if (!row.path.startsWith('uploads/') || row.path.includes('..')) throw new HttpError(400, '不能删除该文件');
      const usedBy = [store.read('catalog'), store.read('site'), store.read('clients')].some((doc) => JSON.stringify(doc).includes(row.path));
      if (usedBy) throw new HttpError(400, '仍有内容使用这张图片，请先更换引用');
      const absolute = path.join(uploadDir, path.basename(row.path));
      if (fs.existsSync(absolute)) fs.unlinkSync(absolute);
      store.write('media', media.filter((item) => item.id !== row.id));
      saved(res, { ok: true });
    } catch (error) {
      next(error);
    }
  });

  app.use('/api/admin', admin);

  app.get('/', sendGenerated('index.html', 'html'));
  app.get('/index.html', sendGenerated('index.html', 'html'));
  app.get('/data.js', sendGenerated('data.js', 'js'));
  app.get('/clients.js', sendGenerated('clients.js', 'js'));
  app.get('/site-content.js', sendGenerated('site-content.js', 'js'));
  app.get('/runtime.js', sendGenerated('runtime.js', 'js'));

  const adminDir = path.join(ROOT, 'admin');
  app.get(['/admin', '/admin/'], (req, res) => {
    res.sendFile(path.join(adminDir, 'index.html'));
  });
  app.use('/admin', express.static(adminDir, { index: false, fallthrough: true }));
  app.get(/^\/admin(?:\/.*)?$/, (req, res) => {
    res.sendFile(path.join(adminDir, 'index.html'));
  });

  app.use('/uploads', express.static(uploadDir, { fallthrough: false, index: false }));

  app.use((req, res, next) => {
    const blocked = ['/server', '/content', '/test', '/node_modules', '/generated', '/docs', '/scripts', '/.git', '/package.json', '/package-lock.json', '/Dockerfile', '/docker-compose.yml', '/.env'];
    if (blocked.some((prefix) => req.path === prefix || req.path.startsWith(prefix + '/'))) {
      res.status(404).type('text/plain').send('Not found');
      return;
    }
    next();
  });
  app.use(express.static(ROOT, { index: false, dotfiles: 'ignore' }));

  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    const status = error.status || (error.type === 'entity.parse.failed' ? 400 : 500);
    const message = status === 500 ? '服务器暂时无法完成这个操作' : (error.message || '请求未完成');
    if (status === 500) console.error(error);
    res.status(status).json({ error: message, details: error.details || undefined });
  });

  return { app, store, publishNow, contentDir, generatedDir, uploadDir };
}

function assertRefs(catalog, product) {
  if (!catalog.categories.some((item) => item.id === product.category)) {
    throw new HttpError(400, '分类不存在', [{ path: 'category', message: '请选择已有分类' }]);
  }
  if (!catalog.colors.some((item) => item.id === product.colorId)) {
    throw new HttpError(400, '配色不存在', [{ path: 'colorId', message: '请选择已有配色' }]);
  }
}

function assertSelection(catalog, selection) {
  const known = new Set(catalog.products.map((item) => item.id));
  for (const id of selection) {
    if (!known.has(id)) throw new HttpError(400, '方案引用了不存在的产品', [{ path: 'selection', message: id }]);
  }
}

function sniff(buf) {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { ext: 'jpg' };
  if (buf.length > 8 && buf[0] === 0x89 && buf.toString('ascii', 1, 4) === 'PNG') return { ext: 'png' };
  if (buf.length > 6 && (buf.toString('ascii', 0, 6) === 'GIF87a' || buf.toString('ascii', 0, 6) === 'GIF89a')) return { ext: 'gif' };
  if (buf.length > 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return { ext: 'webp' };
  return null;
}

module.exports = { createApp, sniff };
