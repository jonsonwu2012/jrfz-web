(() => {
  'use strict';

  const NAV = [
    { href: '#/dashboard', label: '概览' },
    { group: '站点' },
    { href: '#/site/seo', label: '搜索与标题' },
    { href: '#/site/contact', label: '联系方式' },
    { href: '#/site/chrome', label: '导航与页脚' },
    { href: '#/site/shared', label: '共用号召与流程' },
    { group: '页面文案' },
    { href: '#/site/home', label: '首页' },
    { href: '#/site/catalog', label: '产品中心' },
    { href: '#/site/detail', label: '产品详情' },
    { href: '#/site/solutions', label: '配套方案文案' },
    { href: '#/site/custom', label: '定制服务' },
    { href: '#/site/about', label: '关于君荣' },
    { href: '#/site/factory', label: '工厂实景' },
    { href: '#/site/clientsPage', label: '合作酒店文案' },
    { href: '#/site/inquiry', label: '询价页' },
    { href: '#/site/notFound', label: '未找到页' },
    { href: '#/site/toasts', label: '提示语' },
    { href: '#/site/receipt', label: '询价单' },
    { group: '目录与客户' },
    { href: '#/categories', label: '产品分类' },
    { href: '#/products', label: '产品' },
    { href: '#/colors', label: '配色' },
    { href: '#/scenes', label: '配套方案' },
    { href: '#/brands', label: '酒店品牌' },
    { href: '#/landmarks', label: '代表酒店' },
    { href: '#/regions', label: '客户名录' },
    { group: '资料' },
    { href: '#/media', label: '媒体库' },
    { href: '#/inquiries', label: '询盘' },
    { href: '#/account', label: '账号' }
  ];

  const META = {
    seo: ['搜索与标题', '设置浏览器标题、搜索摘要和主题色。发布后会写入网站首页的源代码。'],
    contact: ['联系方式', '电话、邮箱和地址。留空则前台页脚不显示，现有版式保持不变。'],
    chrome: ['导航与页脚', '管理顶部导航、页脚标语、公司名称和页脚链接。'],
    shared: ['共用区块', '多个页面底部共用的询价号召，以及首页和定制页共用的四步流程。'],
    home: ['首页', '编辑首屏、品类条、系列区、合作酒店引言、场景区和配色区。'],
    catalog: ['产品中心', '编辑目录页的标题、搜索提示、空状态和筛选项名称。'],
    detail: ['产品详情', '编辑详情页的规格表标签、选项卡和说明段落。产品本身在「产品」中维护。'],
    solutions: ['配套方案文案', '编辑方案页的标题和说明。每套方案的内容在「配套方案」中维护。'],
    custom: ['定制服务', '编辑定制服务页的引言和四项服务。'],
    about: ['关于君荣', '编辑关于页的理念、标准、合作步骤和统计项名称。数字由客户名录自动计算。'],
    factory: ['工厂实景', '编辑工厂页的标题和每一道工序的图片、说明。'],
    clientsPage: ['合作酒店文案', '编辑合作酒店页的标题、筛选名称和页尾说明。名单本身在客户名录中维护。'],
    inquiry: ['询价页', '编辑询价表单的字段名称、项目类型和提交后的提示。'],
    notFound: ['未找到页', '编辑地址无法匹配时显示的标题和按钮。'],
    toasts: ['提示语', '编辑加入清单、申请样品和移除选型时出现的短提示。'],
    receipt: ['询价单', '编辑下载的 Markdown 询价单标题和字段名。'],
    account: ['账号', '修改后台登录密码。请在部署到服务器前更换默认密码。']
  };

  const LABEL = {
    title: '标题', pageTitle: '页面标题', description: '网站描述', themeColor: '主题色', titleSuffix: '内页标题后缀',
    phone: '电话', email: '邮箱', address: '地址', hours: '营业时间',
    skipLink: '跳过链接', quoteNav: '询价清单按钮', headerCta: '获取报价按钮', menuOpen: '菜单按钮',
    footerTaglineHtml: '页脚标语', footerCompany: '公司名称', footerCopyright: '版权行', footerDisclaimer: '免责声明',
    navigation: '主导航', footerLinks: '页脚链接', id: '标识', label: '名称', href: '链接',
    ctaTitle: '号召标题', ctaButton: '号召按钮', processEyeline: '流程眉题', processTitleHtml: '流程标题',
    processIntro: '流程说明', processSteps: '流程步骤', text: '说明',
    heroTitleHtml: '首屏标题', heroTextHtml: '首屏说明', heroPrimary: '主按钮', heroPrimaryHref: '主按钮链接',
    heroSecondary: '次按钮', heroSecondaryHref: '次按钮链接', heroSignature: '英文落款', heroImage: '首屏图片',
    heroImageAlt: '首屏图片说明', categoryStrip: '品类条', en: '英文', collectionEyeline: '系列眉题',
    collectionTitle: '系列标题', collectionLink: '系列链接文字', collectionTailLeft: '系列区左注', collectionTailRight: '系列区右注',
    clientsEyeline: '客户区眉题', clientsTitleHtml: '客户区标题', clientsLink: '客户区链接', clientsHighlights: '列举的酒店',
    clientsTail: '客户区结尾句', sceneTitleHtml: '场景区标题', sceneText: '场景区说明', sceneCta: '场景按钮',
    sceneCaption: '场景图注', sceneTabsLabel: '场景切换名称', paletteEyeline: '配色眉题', paletteTitle: '配色标题',
    paletteLink: '配色链接文字', paletteLinkHref: '配色链接', paletteIntro: '配色说明', paletteNote: '配色脚注',
    brandWallLimit: '首页品牌墙数量', headingHtml: '页标题', intro: '导语', allLabel: '全部产品',
    searchPlaceholder: '搜索占位', searchLabel: '搜索无障碍名称', materialLabel: '材质筛选项', materialAll: '材质「全部」',
    colorLabel: '配色筛选项', colorAll: '配色「全部」', metaNote: '目录说明', countSuffix: '数量后缀',
    emptyTitle: '无结果标题', emptyText: '无结果说明', clearFilters: '清除筛选', cardDetail: '卡片动作', menuLabel: '分类菜单名称',
    photoAltSuffix: '图片替代文字后缀', photoNote: '图片下的说明', materialSuffix: '材质后缀', colorSuffix: '颜色后缀',
    seriesLabel: '系列标签', specLabel: '规格标签', specValue: '规格内容', priceLabel: '报价标签', priceValue: '报价内容',
    qtyLabel: '数量标签', addButton: '加入清单按钮', sampleButton: '样品按钮', note: '注释',
    sizeNoteBed: '床品尺寸提示', sizeNoteCore: '芯类尺寸提示', sizeNoteDefault: '其他品类尺寸提示',
    tabsLabel: '选项卡名称', tabs: '选项卡', descriptionSuffix: '说明段后缀', descriptionSeries: '系列说明句',
    specsBody: '规格第一段', specsBody2: '规格第二段', careBody: '洗涤第一段', careBody2: '洗涤第二段',
    crumbHome: '面包屑「首页」', crumbProducts: '面包屑「产品中心」', optionsLabel: '规格组名称', defaultOption: '默认选中规格',
    photoAltSuffix2: '图片说明', caption: '图注', eyelineSuffix: '英文眉题', projectButton: '发起询价按钮',
    projectNote: '方案注释', selectionTitle: '选型标题', selectionLink: '选型链接', eyeline: '眉题', titleHtml: '标题',
    body: '正文', services: '服务项目', lead: '导语', signature: '英文落款', statClients: '客户数名称',
    statFive: '五星数名称', statBrands: '品牌数名称', statCategories: '品类数名称', philosophyEyeline: '理念眉题',
    philosophyTitleHtml: '理念标题', philosophy: '理念段落', standardEyeline: '标准眉题', standardTitleHtml: '标准标题',
    pillars: '标准支柱', points: '要点', proofEyeline: '见证眉题', proofTitleHtml: '见证标题', proofBody: '见证正文',
    proofImage: '见证图片', proofImageAlt: '见证图片说明', proofButton: '见证按钮', workEyeline: '合作眉题',
    workTitleHtml: '合作标题', workIntro: '合作说明', steps: '步骤', factoryLink: '工厂链接', image: '图片',
    footEyeline: '页尾眉题', footTitleHtml: '页尾标题', footBody: '页尾正文', footButton: '页尾按钮',
    statRegions: '区域统计句', brandsEyeline: '品牌眉题', brandsTitle: '品牌标题', landmarksEyeline: '地标眉题',
    landmarksTitle: '地标标题', landmarksNote: '地标说明', directoryEyeline: '名录眉题', directoryTitle: '名录标题',
    countLabel: '数量句', regionCount: '地区数量句', regionAll: '全部地区', starsAll: '全部星级', starsFive: '五星',
    starsFour: '四星', starsThree: '三星', searchLabel: '搜索名称', empty: '无结果', clear: '清除筛选',
    regionLabel: '地区筛选名', starsLabel: '星级筛选名', formTitle: '表单标题', organizationLabel: '公司字段',
    organizationPlaceholder: '公司占位', contactLabel: '联系人字段', contactPlaceholder: '联系人占位',
    phoneLabel: '电话字段', phonePlaceholder: '电话占位', projectTypeLabel: '项目类型字段', projectTypes: '项目类型',
    roomsLabel: '客房数字段', roomsPlaceholder: '客房数占位', deliveryLabel: '交付时间字段', notesLabel: '补充需求字段',
    notesPlaceholder: '补充需求占位', consent: '同意声明', submit: '提交按钮', localNoteHtml: '本地生成说明', serverNoteHtml: '服务器提交说明', sendFailed: '提交失败提示',
    successTitle: '本地成功标题', successBody: '本地成功说明', sentTitle: '已提交标题', sentBody: '已提交说明',
    download: '下载按钮', edit: '继续编辑', quoteHeading: '清单标题', quoteNote: '清单说明', browse: '浏览产品',
    totalNote: '清单脚注', sampleIntent: '样品字样', buyIntent: '采购字样', banner: '未发送说明', sentBanner: '已发送说明',
    needsHeading: '需求标题', itemsHeading: '选型标题', emptyItems: '无选型说明', pendingHeading: '待沟通标题',
    pending: '待沟通事项', privacy: '隐私说明', filename: '下载文件名', pendingValue: '空值占位', fields: '字段名称',
    organization: '公司 / 酒店', contact: '联系人', projectType: '项目类型', rooms: '客房数', delivery: '交付时间', notes: '补充需求',
    added: '加入清单', sample: '申请样品', removed: '移除选型', cn: '中文名', logo: '标志文件', ar: '宽高比',
    name: '名称', use: '用途说明', hex: '色值', unit: '单位', material: '材质', intro: '简介', options: '规格选项',
    optionLabel: '规格名称', color: '颜色名称', colorId: '配色', category: '分类', sort: '排序', enabled: '在网站显示',
    focus: '关注点', selection: '关联产品', brief: '带入询价的说明', palette: '配色方向', desc: '描述', source: '名录来源',
    stars: '星级', hotels: '酒店', city: '城市'
  };

  const state = {
    user: null, schema: null, site: null, catalog: null, clients: null,
    media: [], inquiries: [], library: [], updatedAt: null,
    error: '', ok: '', draft: null, route: location.hash || '#/dashboard'
  };

  const appEl = document.getElementById('app');

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function assetUrl(ref) {
    if (!ref) return '';
    if (String(ref).includes('/')) return '/' + String(ref).replace(/^\/+/, '');
    return '/assets/' + ref + '.webp';
  }

  async function api(url, options = {}) {
    const opts = {
      method: options.method || 'GET',
      headers: { 'X-Requested-With': 'JRAdmin' }
    };
    if (options.body && !(options.body instanceof FormData)) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(options.body);
    } else if (options.body) {
      opts.body = options.body;
    }
    const response = await fetch(url, opts);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.error || '请求失败');
      error.details = data.details || [];
      error.status = response.status;
      throw error;
    }
    return data;
  }

  async function boot() {
    try {
      state.user = await api('/api/auth/me');
      await loadAll();
    } catch {
      state.user = null;
    }
    render();
  }

  async function loadAll() {
    const [schema, data] = await Promise.all([api('/api/admin/schema'), api('/api/admin/bootstrap')]);
    state.schema = schema;
    state.site = data.site;
    state.catalog = data.catalog;
    state.clients = data.clients;
    state.media = data.media;
    state.inquiries = data.inquiries;
    state.library = data.library;
    state.updatedAt = data.updatedAt;
  }

  function sorted(list) {
    return [...(list || [])].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0) || String(a.id).localeCompare(String(b.id)));
  }

  function label(section, key) {
    return LABEL[section + '.' + key] || LABEL[key] || key;
  }

  function navActive(href) {
    if (state.route === href || state.route.startsWith(href + '/')) return true;
    const aliases = {
      '#/products': '#/product/',
      '#/categories': '#/category/',
      '#/colors': '#/color/',
      '#/scenes': '#/scene/',
      '#/brands': '#/brand/',
      '#/landmarks': '#/landmark/',
      '#/regions': '#/region/',
      '#/inquiries': '#/inquiry/'
    };
    return aliases[href] && state.route.startsWith(aliases[href]);
  }

  function shell(inner) {
    const nav = NAV.map((item) => item.group
      ? '<div class="nav-group">' + esc(item.group) + '</div>'
      : '<a href="' + item.href + '" class="' + (navActive(item.href) ? 'active' : '') + '">' + esc(item.label) + '</a>'
    ).join('');
    return '<div class="shell"><aside class="sidebar"><div class="brand-lockup"><strong>君荣纺织</strong><span>内容管理</span></div>' + nav + '</aside><div class="main"><header class="topbar"><div class="eyebrow" style="margin:0">JUNRONG CMS</div><div class="who"><a href="/" target="_blank" rel="noopener">查看网站</a><span>' + esc(state.user.username) + '</span><button class="btn secondary small" id="logout" type="button">退出</button></div></header><div class="page">' + inner + '</div></div></div>';
  }

  function banner() {
    if (state.error) return '<div class="banner">' + esc(state.error) + (state.details || []).map((item) => '<div>' + esc((item.path ? item.path + '：' : '') + item.message) + '</div>').join('') + '</div>';
    if (state.ok) return '<div class="banner ok">' + esc(state.ok) + '</div>';
    return '';
  }

  function pageHead(title, goal) {
    return '<div class="page-head"><p class="eyebrow">内容管理</p><h1>' + esc(title) + '</h1><p>' + esc(goal) + '</p></div>' + banner();
  }

  function bindPath(path) { return ' data-bind="' + esc(path) + '"'; }

  function inputFor(field, value, path, section) {
    const name = label(section, field.key);
    const hint = field.rich ? '<div class="hint">换行写 &lt;br&gt;。手机端可断行处写 &lt;br class="mobile-break"&gt;。</div>' : '';
    if (field.type === 'bool') {
      return '<label class="field check"><input type="checkbox"' + bindPath(path) + (value ? ' checked' : '') + '>' + esc(name) + '</label>';
    }
    if (field.type === 'lines') {
      const text = Array.isArray(value) ? value.join('\n') : '';
      return '<label class="field">' + esc(name) + '<textarea' + bindPath(path) + ' data-kind="lines">' + esc(text) + '</textarea><div class="hint">每行一条。</div></label>';
    }
    if (field.type === 'textarea') {
      return '<label class="field">' + esc(name) + '<textarea' + bindPath(path) + '>' + esc(value || '') + '</textarea>' + hint + '</label>';
    }
    if (field.type === 'int') {
      return '<label class="field">' + esc(name) + '<input type="number"' + bindPath(path) + ' data-kind="int" value="' + esc(value ?? 0) + '"></label>';
    }
    if (field.type === 'hex') {
      return '<label class="field">' + esc(name) + '<input' + bindPath(path) + ' value="' + esc(value || '') + '" placeholder="#F7F5EF"></label>';
    }
    if (field.type === 'image') {
      return '<label class="field">' + esc(name) + imagePicker(path, value) + '</label>';
    }
    return '<label class="field">' + esc(name) + '<input' + bindPath(path) + ' value="' + esc(value || '') + '"></label>';
  }

  function imagePicker(path, value) {
    const options = ['<option value="">从已有图片选择</option>']
      .concat(state.library.map((item) => '<option value="' + esc(item) + '"' + (item === value ? ' selected' : '') + '>' + esc(item) + '</option>'))
      .concat(state.media.map((item) => '<option value="' + esc(item.path) + '"' + (item.path === value ? ' selected' : '') + '>' + esc(item.path) + '</option>'));
    const preview = value ? '<img class="thumb" alt="" src="' + esc(assetUrl(value)) + '" style="margin-top:8px">' : '';
    return '<input' + bindPath(path) + ' value="' + esc(value || '') + '" placeholder="bed-1 或 uploads/文件名.webp"><select data-fill="' + esc(path) + '">' + options.join('') + '</select>' + preview;
  }

  function renderFields(fields, source, base, section) {
    return fields.map((field) => {
      const path = base ? base + '.' + field.key : field.key;
      const value = source ? source[field.key] : '';
      if (field.type === 'group') {
        return '<div class="card"><h2>' + esc(label(section, field.key)) + '</h2>' + renderFields(field.fields, value || {}, path, section) + '</div>';
      }
      if (field.type === 'objects') {
        const items = Array.isArray(value) ? value : [];
        return '<div class="card"><div class="repeater-head"><h2>' + esc(label(section, field.key)) + '</h2><button class="btn secondary small" type="button" data-add="' + esc(path) + '">添加</button></div>' +
          items.map((item, index) => '<div class="repeater"><div class="repeater-head"><strong>第 ' + (index + 1) + ' 项</strong><button class="btn danger small" type="button" data-remove="' + esc(path) + '.' + index + '">删除</button></div>' + renderFields(field.fields, item, path + '.' + index, section) + '</div>').join('') +
          '</div>';
      }
      return inputFor(field, value, path, section);
    }).join('');
  }

  function readControl(el) {
    if (el.type === 'checkbox') return el.checked;
    if (el.dataset.kind === 'lines') return el.value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    if (el.dataset.kind === 'int') return Number(el.value);
    return el.value;
  }

  function setPath(obj, path, value) {
    const parts = path.split('.');
    let cur = obj;
    for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]];
    cur[parts[parts.length - 1]] = value;
  }

  function getPath(obj, path) {
    return path.split('.').reduce((cur, key) => cur == null ? undefined : cur[key], obj);
  }

  function fieldAt(path) {
    const parts = path.split('.');
    let fields = state.schema[state.section];
    let rule = null;
    for (const part of parts) {
      if (/^\d+$/.test(part)) continue;
      rule = (fields || []).find((item) => item.key === part);
      fields = rule && rule.fields;
    }
    return rule;
  }

  function blankFrom(rule) {
    const item = {};
    for (const field of rule.fields || []) {
      if (field.type === 'lines' || field.type === 'objects') item[field.key] = [];
      else if (field.type === 'int') item[field.key] = 0;
      else if (field.type === 'bool') item[field.key] = true;
      else if (field.type === 'group') item[field.key] = blankFrom(field);
      else item[field.key] = '';
    }
    return item;
  }

  function dashboard() {
    const hotels = state.clients.regions.reduce((sum, region) => sum + region.hotels.length, 0);
    const cards = [
      ['#/products', state.catalog.products.length, '产品'],
      ['#/categories', state.catalog.categories.length, '分类'],
      ['#/colors', state.catalog.colors.length, '配色'],
      ['#/scenes', state.catalog.scenes.length, '配套方案'],
      ['#/brands', state.clients.brands.length, '酒店品牌'],
      ['#/landmarks', state.clients.landmarks.length, '代表酒店'],
      ['#/regions', hotels, '名录酒店'],
      ['#/inquiries', state.inquiries.length, '询盘']
    ];
    return pageHead('概览', '从这里进入要修改的内容。保存后刷新网站即可看到变化；推送到 GitHub 后，Actions 会用这些内容重新发布静态站。') +
      '<div class="stats">' + cards.map(([href, n, name]) => '<a class="stat" href="' + href + '"><b>' + n + '</b><span>' + name + '</span></a>').join('') + '</div>' +
      '<div class="card"><h2>最近保存</h2><p class="muted">' + esc(state.updatedAt ? new Date(state.updatedAt).toLocaleString('zh-CN') : '尚未在此后台保存过。当前内容来自网站原稿。') + '</p></div>';
  }

  function sectionView(name) {
    const meta = META[name];
    state.section = name;
    if (!state.draft || state.draftSection !== name) {
      state.draft = JSON.parse(JSON.stringify(state.site[name]));
      state.draftSection = name;
    }
    return pageHead(meta[0], meta[1]) + '<form id="section-form">' + renderFields(state.schema[name], state.draft, '', name) +
      '<div class="form-actions"><button class="btn" type="submit">保存这一页</button></div></form>';
  }

  function table(headers, rows) {
    return '<div class="table-wrap"><table><thead><tr>' + headers.map((item) => '<th>' + item + '</th>').join('') + '</tr></thead><tbody>' +
      (rows || '<tr><td colspan="' + headers.length + '" class="muted">还没有内容。</td></tr>') + '</tbody></table></div>';
  }

  function moveButtons(collection, index, total) {
    return '<button class="btn secondary small" type="button" data-move="' + collection + '" data-index="' + index + '" data-dir="-1"' + (index === 0 ? ' disabled' : '') + '>上移</button>' +
      '<button class="btn secondary small" type="button" data-move="' + collection + '" data-index="' + index + '" data-dir="1"' + (index === total - 1 ? ' disabled' : '') + '>下移</button>';
  }

  function categoriesView() {
    const rows = sorted(state.catalog.categories);
    return pageHead('产品分类', '六个系列出现在首页和产品中心。标识用于链接，创建后不要随意更改。') +
      '<p><a class="btn" href="#/category/new">新建分类</a></p>' +
      table(['', '名称', '英文', '状态', ''], rows.map((row, index) => '<tr><td><img class="thumb" alt="" src="' + esc(assetUrl(row.image)) + '"></td><td>' + esc(row.name) + '<div class="muted">' + esc(row.id) + '</div></td><td>' + esc(row.en) + '</td><td>' + (row.enabled === false ? '<span class="tag off">隐藏</span>' : '<span class="tag">显示</span>') + '</td><td class="row-actions">' + moveButtons('categories', index, rows.length) + '<a class="btn secondary small" href="#/category/' + esc(row.id) + '">编辑</a><button class="btn danger small" data-del="categories" data-id="' + esc(row.id) + '" type="button">删除</button></td></tr>').join(''));
  }

  function productsView() {
    const rows = sorted(state.catalog.products);
    const cats = Object.fromEntries(state.catalog.categories.map((item) => [item.id, item.name]));
    return pageHead('产品', '维护产品名称、图片、材质、配色和规格。隐藏的产品不会出现在网站上。') +
      '<p><a class="btn" href="#/product/new">新建产品</a></p>' +
      table(['', '产品', '分类', '配色', '状态', ''], rows.map((row, index) => '<tr><td><img class="thumb" alt="" src="' + esc(assetUrl(row.image)) + '"></td><td>' + esc(row.name) + '<div class="muted">' + esc(row.id) + '</div></td><td>' + esc(cats[row.category] || row.category) + '</td><td>' + esc(row.color) + '</td><td>' + (row.enabled === false ? '<span class="tag off">隐藏</span>' : '<span class="tag">显示</span>') + '</td><td class="row-actions">' + moveButtons('products', index, rows.length) + '<a class="btn secondary small" href="#/product/' + esc(row.id) + '">编辑</a><button class="btn danger small" data-del="products" data-id="' + esc(row.id) + '" type="button">删除</button></td></tr>').join(''));
  }

  function colorsView() {
    const rows = sorted(state.catalog.colors);
    return pageHead('配色', '这些颜色出现在首页色板和产品筛选中。') +
      '<p><a class="btn" href="#/color/new">新建配色</a></p>' +
      table(['色块', '名称', '色值', '用途', ''], rows.map((row, index) => '<tr><td><span style="display:inline-block;width:36px;height:24px;border:1px solid #ddd;background:' + esc(row.hex) + '"></span></td><td>' + esc(row.name) + '</td><td>' + esc(row.hex) + '</td><td>' + esc(row.use) + '</td><td class="row-actions">' + moveButtons('colors', index, rows.length) + '<a class="btn secondary small" href="#/color/' + esc(row.id) + '">编辑</a><button class="btn danger small" data-del="colors" data-id="' + esc(row.id) + '" type="button">删除</button></td></tr>').join(''));
  }

  function scenesView() {
    const rows = sorted(state.catalog.scenes);
    return pageHead('配套方案', '商务酒店、精品民宿、高端酒店三套方案。每套方案选择若干产品，并写明带入询价单的说明。') +
      '<p><a class="btn" href="#/scene/new">新建方案</a></p>' +
      table(['', '方案', '配色', '产品数', ''], rows.map((row, index) => '<tr><td><img class="thumb" alt="" src="' + esc(assetUrl(row.image)) + '"></td><td>' + esc(row.name) + '</td><td>' + esc(row.palette) + '</td><td>' + row.selection.length + '</td><td class="row-actions">' + moveButtons('scenes', index, rows.length) + '<a class="btn secondary small" href="#/scene/' + esc(row.id) + '">编辑</a><button class="btn danger small" data-del="scenes" data-id="' + esc(row.id) + '" type="button">删除</button></td></tr>').join(''));
  }

  function brandsView() {
    const rows = sorted(state.clients.brands);
    return pageHead('酒店品牌', '合作酒店页的品牌墙。没有标志文件时显示英文名。标志键对应 assets/logos 下的文件名，不含扩展名。') +
      '<p><a class="btn" href="#/brand/new">新建品牌</a></p>' +
      table(['品牌', '中文', '标志', ''], rows.map((row, index) => '<tr><td>' + esc(row.name) + '</td><td>' + esc(row.cn) + '</td><td class="muted">' + esc(row.logo || '文字') + '</td><td class="row-actions">' + moveButtons('brands', index, rows.length) + '<a class="btn secondary small" href="#/brand/' + esc(row.id) + '">编辑</a><button class="btn danger small" data-del="brands" data-id="' + esc(row.id) + '" type="button">删除</button></td></tr>').join(''));
  }

  function landmarksView() {
    const rows = sorted(state.clients.landmarks);
    return pageHead('代表酒店', '城市地标酒店，显示在合作酒店页的第二段。') +
      '<p><a class="btn" href="#/landmark/new">新建代表酒店</a></p>' +
      table(['酒店', '英文', '城市', ''], rows.map((row, index) => '<tr><td>' + esc(row.name) + '</td><td>' + esc(row.en) + '</td><td>' + esc(row.city) + '</td><td class="row-actions">' + moveButtons('landmarks', index, rows.length) + '<a class="btn secondary small" href="#/landmark/' + esc(row.id) + '">编辑</a><button class="btn danger small" data-del="landmarks" data-id="' + esc(row.id) + '" type="button">删除</button></td></tr>').join(''));
  }

  function regionsView() {
    const rows = sorted(state.clients.regions);
    return pageHead('客户名录', '按地区维护星级酒店客户。页面上的酒店数量和五星数量会随之变化。') +
      '<form id="source-form" class="card"><h2>名录来源</h2><label class="field">说明<input name="source" value="' + esc(state.clients.source) + '"></label><button class="btn" type="submit">保存来源说明</button></form>' +
      '<p><a class="btn" href="#/region/new">新建地区</a></p>' +
      table(['地区', '酒店数', ''], rows.map((row, index) => '<tr><td>' + esc(row.name) + '</td><td>' + row.hotels.length + '</td><td class="row-actions">' + moveButtons('regions', index, rows.length) + '<a class="btn secondary small" href="#/region/' + esc(row.id) + '">编辑酒店</a><button class="btn danger small" data-del="regions" data-id="' + esc(row.id) + '" type="button">删除</button></td></tr>').join(''));
  }

  function entityForm(title, goal, body, submitLabel) {
    return pageHead(title, goal) + '<form id="entity-form" class="card"><div class="grid-2">' + body + '</div><div class="form-actions"><a class="btn secondary" href="' + esc(state.back || '#/dashboard') + '">返回</a><button class="btn" type="submit">' + esc(submitLabel || '保存') + '</button></div></form>';
  }

  function textField(key, value, extra) {
    return '<label class="field">' + esc(LABEL[key] || key) + '<input name="' + key + '" value="' + esc(value ?? '') + '" ' + (extra || '') + '></label>';
  }

  function areaField(key, value) {
    return '<label class="field" style="grid-column:1/-1">' + esc(LABEL[key] || key) + '<textarea name="' + key + '">' + esc(value ?? '') + '</textarea></label>';
  }

  function linesField(key, value, hint) {
    return '<label class="field" style="grid-column:1/-1">' + esc(LABEL[key] || key) + '<textarea name="' + key + '">' + esc((value || []).join('\n')) + '</textarea><div class="hint">' + esc(hint || '每行一条。') + '</div></label>';
  }

  function selectField(key, value, options) {
    return '<label class="field">' + esc(LABEL[key] || key) + '<select name="' + key + '">' + options.map((item) => '<option value="' + esc(item.value) + '"' + (item.value === value ? ' selected' : '') + '>' + esc(item.label) + '</option>').join('') + '</select></label>';
  }

  function categoryEditor(id) {
    const creating = id === 'new';
    const row = creating ? { id: '', name: '', en: '', image: '', description: '', sort: state.catalog.categories.length, enabled: true } : state.catalog.categories.find((item) => item.id === id);
    if (!row) return pageHead('未找到', '这条分类不存在。');
    state.back = '#/categories';
    return entityForm(creating ? '新建分类' : '编辑分类', '标识只用小写英文和短横线，例如 bed。',
      textField('id', row.id, creating ? '' : 'readonly') + textField('name', row.name) + textField('en', row.en) + textField('sort', row.sort) +
      '<label class="field" style="grid-column:1/-1">图片' + imagePicker('image', row.image) + '</label>' + areaField('description', row.description) +
      '<label class="field check"><input type="checkbox" name="enabled"' + (row.enabled !== false ? ' checked' : '') + '>在网站显示</label>',
      creating ? '创建' : '保存');
  }

  function productEditor(id) {
    const creating = id === 'new';
    const row = creating ? { id: '', category: state.catalog.categories[0].id, name: '', image: '', unit: '件', material: '', intro: '', options: ['常规选型'], optionLabel: '规格需求', color: state.catalog.colors[0].name, colorId: state.catalog.colors[0].id, sort: state.catalog.products.length, enabled: true } : state.catalog.products.find((item) => item.id === id);
    if (!row) return pageHead('未找到', '这条产品不存在。');
    state.back = '#/products';
    return entityForm(creating ? '新建产品' : '编辑产品', '规格每行一个。颜色名称应与所选配色一致，方便筛选。',
      textField('id', row.id, creating ? '' : 'readonly') + textField('name', row.name) +
      selectField('category', row.category, state.catalog.categories.map((item) => ({ value: item.id, label: item.name }))) +
      selectField('colorId', row.colorId, state.catalog.colors.map((item) => ({ value: item.id, label: item.name }))) +
      textField('color', row.color) + textField('material', row.material) + textField('unit', row.unit) + textField('optionLabel', row.optionLabel) + textField('sort', row.sort) +
      '<label class="field" style="grid-column:1/-1">图片' + imagePicker('image', row.image) + '</label>' +
      areaField('intro', row.intro) + linesField('options', row.options, '每行一个规格。') +
      '<label class="field check"><input type="checkbox" name="enabled"' + (row.enabled !== false ? ' checked' : '') + '>在网站显示</label>');
  }

  function colorEditor(id) {
    const creating = id === 'new';
    const row = creating ? { id: '', name: '', hex: '#F7F5EF', use: '', sort: state.catalog.colors.length } : state.catalog.colors.find((item) => item.id === id);
    if (!row) return pageHead('未找到', '这个配色不存在。');
    state.back = '#/colors';
    return entityForm(creating ? '新建配色' : '编辑配色', '色值使用 #RGB 或 #RRGGBB。修改名称时，使用该配色的产品颜色名会一起更新。',
      textField('id', row.id, creating ? '' : 'readonly') + textField('name', row.name) + textField('hex', row.hex) + textField('use', row.use) + textField('sort', row.sort));
  }

  function sceneEditor(id) {
    const creating = id === 'new';
    const row = creating ? { id: '', name: '', image: '', title: '', desc: '', focus: [''], selection: [], brief: '', palette: '', sort: state.catalog.scenes.length, enabled: true } : state.catalog.scenes.find((item) => item.id === id);
    if (!row) return pageHead('未找到', '这个方案不存在。');
    state.back = '#/scenes';
    const productOptions = sorted(state.catalog.products).map((item) => '<option value="' + esc(item.id) + '"' + (row.selection.includes(item.id) ? ' selected' : '') + '>' + esc(item.name) + '</option>').join('');
    return entityForm(creating ? '新建方案' : '编辑方案', '按住 Ctrl 或 Command 可多选关联产品。关注点每行一条。',
      textField('id', row.id, creating ? '' : 'readonly') + textField('name', row.name) + textField('palette', row.palette) + textField('sort', row.sort) +
      '<label class="field" style="grid-column:1/-1">图片' + imagePicker('image', row.image) + '</label>' +
      textField('title', row.title) + areaField('desc', row.desc) + linesField('focus', row.focus.filter(Boolean)) + areaField('brief', row.brief) +
      '<label class="field" style="grid-column:1/-1">关联产品<select name="selection" multiple size="8">' + productOptions + '</select></label>' +
      '<label class="field check"><input type="checkbox" name="enabled"' + (row.enabled !== false ? ' checked' : '') + '>在网站显示</label>');
  }

  function brandEditor(id) {
    const creating = id === 'new';
    const row = creating ? { id: '', name: '', cn: '', logo: '', ar: 0, sort: state.clients.brands.length } : state.clients.brands.find((item) => item.id === id);
    if (!row) return pageHead('未找到', '这个品牌不存在。');
    state.back = '#/brands';
    return entityForm(creating ? '新建品牌' : '编辑品牌', '标志留空则显示英文名。已有标志填写文件键，例如 shangrila；新上传的图片填写 uploads/ 路径。',
      textField('id', row.id, creating ? '' : 'readonly') + textField('name', row.name) + textField('cn', row.cn) + textField('logo', row.logo) + textField('ar', row.ar) + textField('sort', row.sort));
  }

  function landmarkEditor(id) {
    const creating = id === 'new';
    const row = creating ? { id: '', name: '', en: '', city: '', sort: state.clients.landmarks.length } : state.clients.landmarks.find((item) => item.id === id);
    if (!row) return pageHead('未找到', '这家酒店不存在。');
    state.back = '#/landmarks';
    return entityForm(creating ? '新建代表酒店' : '编辑代表酒店', '用于合作酒店页的地标列表。',
      textField('id', row.id, creating ? '' : 'readonly') + textField('name', row.name) + textField('en', row.en) + textField('city', row.city) + textField('sort', row.sort));
  }

  function regionEditor(id) {
    const creating = id === 'new';
    if (!state.draft || state.draftKind !== 'region' || state.draftId !== id) {
      state.draft = creating ? { id: '', name: '', sort: state.clients.regions.length, hotels: [] } : JSON.parse(JSON.stringify(state.clients.regions.find((item) => item.id === id) || null));
      state.draftKind = 'region';
      state.draftId = id;
    }
    if (!state.draft) return pageHead('未找到', '这个地区不存在。');
    const hotels = state.draft.hotels.map((hotel, index) => '<tr><td><input data-hotel="name" data-index="' + index + '" value="' + esc(hotel.name) + '"></td><td><input data-hotel="stars" data-index="' + index + '" type="number" min="1" max="5" value="' + esc(hotel.stars) + '"></td><td><button class="btn danger small" type="button" data-hotel-remove="' + index + '">删除</button></td></tr>').join('');
    return pageHead(creating ? '新建地区' : '编辑 ' + state.draft.name, '在这里增删该地区的酒店，并设置宣传册记载的星级。') + banner() +
      '<form id="region-form"><div class="card grid-2">' + textField('id', state.draft.id, creating ? '' : 'readonly') + textField('name', state.draft.name) + textField('sort', state.draft.sort) + '</div>' +
      '<div class="card"><div class="repeater-head"><h2>酒店</h2><button class="btn secondary small" type="button" id="add-hotel">添加酒店</button></div><div class="table-wrap"><table><thead><tr><th>名称</th><th>星级</th><th></th></tr></thead><tbody>' + (hotels || '<tr><td colspan="3" class="muted">还没有酒店。</td></tr>') + '</tbody></table></div></div>' +
      '<div class="form-actions"><a class="btn secondary" href="#/regions">返回</a><button class="btn" type="submit">保存地区</button></div></form>';
  }

  function mediaView() {
    const uploads = state.media.map((item) => '<article class="media-card"><img alt="" src="/' + esc(item.path) + '"><div><code>' + esc(item.path) + '</code><button class="btn danger small" data-media="' + esc(item.id) + '" type="button">删除</button></div></article>').join('');
    return pageHead('媒体库', '上传 JPG、PNG、WEBP 或 GIF，单张不超过 8MB。上传后把路径填到产品或页面的图片栏。网站原有图片列在下方，可直接引用。') +
      '<form id="upload-form" class="card"><h2>上传图片</h2><label class="field">图片说明<input name="alt" maxlength="120"></label><label class="field">文件<input type="file" name="file" accept="image/jpeg,image/png,image/webp,image/gif" required></label><button class="btn" type="submit">上传</button></form>' +
      '<h2>已上传</h2><div class="media-grid">' + (uploads || '<p class="muted">还没有上传。</p>') + '</div>' +
      '<h2 style="margin-top:28px">网站原有图片</h2><div class="media-grid">' + state.library.map((item) => '<article class="media-card"><img alt="" src="/' + esc(item) + '"><div><code>' + esc(item) + '</code></div></article>').join('') + '</div>';
  }

  function inquiriesView() {
    const rows = state.inquiries.map((item) => '<tr><td>' + esc(item.organization) + '</td><td>' + esc(item.contact) + '<div class="muted">' + esc(item.phone) + '</div></td><td>' + esc(item.projectType) + '</td><td>' + item.items.length + '</td><td>' + esc(new Date(item.createdAt).toLocaleString('zh-CN')) + '</td><td class="row-actions"><a class="btn secondary small" href="#/inquiry/' + esc(item.id) + '">查看</a><button class="btn danger small" data-inquiry="' + esc(item.id) + '" type="button">删除</button></td></tr>').join('');
    return pageHead('询盘', '访客在本服务器上提交的询价。GitHub Pages 静态站没有服务器，询价单仍只在访客本机生成。') +
      table(['公司', '联系人', '类型', '选型', '时间', ''], rows);
  }

  function inquiryDetail(id) {
    const row = state.inquiries.find((item) => item.id === id);
    if (!row) return pageHead('未找到', '这条询盘不存在。');
    const items = row.items.map((item) => '<li>' + esc(item.name) + ' · ' + esc(item.option) + ' · ' + esc(item.qty) + esc(item.unit) + ' · ' + esc(item.intent) + '</li>').join('');
    return pageHead(row.organization, '收到于 ' + new Date(row.createdAt).toLocaleString('zh-CN')) +
      '<div class="card"><p>联系人：' + esc(row.contact) + '</p><p>电话：' + esc(row.phone) + '</p><p>项目类型：' + esc(row.projectType) + '</p><p>客房数：' + esc(row.rooms || '未填') + '</p><p>交付时间：' + esc(row.delivery || '未填') + '</p><p>补充：' + esc(row.notes || '无') + '</p><h2>选型</h2><ul>' + (items || '<li>未指定产品</li>') + '</ul><a class="btn secondary" href="#/inquiries">返回列表</a></div>';
  }

  function accountView() {
    return pageHead('账号', META.account[1]) +
      '<form id="password-form" class="card" style="max-width:480px"><label class="field">当前密码<input type="password" name="currentPassword" required></label><label class="field">新密码<input type="password" name="newPassword" required minlength="8"></label><button class="btn" type="submit">更新密码</button></form>';
  }

  function render() {
    const route = state.route;
    if (!state.user) {
      appEl.innerHTML = '<div class="login-screen"><form class="login-card" id="login-form"><p class="eyebrow">JUNRONG</p><h1>登录内容管理</h1><p class="goal">修改网站上的文字、图片、产品和客户名录。</p><label>用户名<input name="username" autocomplete="username" required></label><label>密码<input name="password" type="password" autocomplete="current-password" required></label>' + banner() + '<button class="btn full" type="submit">进入后台</button><p class="login-note">本地默认账号 admin，密码 junrong-admin。正式部署请立即修改。</p></form></div>';
      bind();
      return;
    }
    let body = dashboard();
    const parts = route.replace(/^#\//, '').split('/');
    const head = parts[0];
    const id = decodeURIComponent(parts[1] || '');
    if (head === 'site' && state.schema && state.schema[id]) body = sectionView(id);
    else if (head === 'categories') body = categoriesView();
    else if (head === 'category') body = categoryEditor(id);
    else if (head === 'products') body = productsView();
    else if (head === 'product') body = productEditor(id);
    else if (head === 'colors') body = colorsView();
    else if (head === 'color') body = colorEditor(id);
    else if (head === 'scenes') body = scenesView();
    else if (head === 'scene') body = sceneEditor(id);
    else if (head === 'brands') body = brandsView();
    else if (head === 'brand') body = brandEditor(id);
    else if (head === 'landmarks') body = landmarksView();
    else if (head === 'landmark') body = landmarkEditor(id);
    else if (head === 'regions') body = regionsView();
    else if (head === 'region') body = regionEditor(id);
    else if (head === 'media') body = mediaView();
    else if (head === 'inquiries') body = inquiriesView();
    else if (head === 'inquiry') body = inquiryDetail(id);
    else if (head === 'account') body = accountView();
    appEl.innerHTML = shell(body);
    bind();
  }

  function formData(form) {
    const data = {};
    for (const el of form.elements) {
      if (!el.name || el.type === 'submit') continue;
      if (el.type === 'checkbox') data[el.name] = el.checked;
      else if (el.multiple) data[el.name] = [...el.selectedOptions].map((option) => option.value);
      else data[el.name] = el.value;
    }
    return data;
  }

  function lines(value) {
    return String(value || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  }

  async function saveEntity(kind, id, payload) {
    const creating = id === 'new';
    const path = '/api/admin/' + kind + (creating ? '' : '/' + encodeURIComponent(id));
    await api(path, { method: creating ? 'POST' : 'PUT', body: payload });
    await loadAll();
    state.ok = '已保存，刷新网站即可看到。';
    state.error = '';
    location.hash = '#/' + (kind === 'categories' ? 'categories' : kind);
  }

  function bind() {
    const login = document.getElementById('login-form');
    if (login) {
      login.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const data = formData(login);
        try {
          state.user = (await api('/api/auth/login', { method: 'POST', body: data })).user;
          state.error = '';
          await loadAll();
          location.hash = '#/dashboard';
          render();
        } catch (error) {
          state.error = error.message;
          render();
        }
      });
      return;
    }
    document.getElementById('logout').addEventListener('click', async () => {
      await api('/api/auth/logout', { method: 'POST', body: {} });
      state.user = null;
      location.hash = '#/dashboard';
      render();
    });
    appEl.querySelectorAll('[data-bind]').forEach((el) => {
      const write = () => {
        if (state.draft && (state.draftSection || state.draftKind)) setPath(state.draft, el.dataset.bind, readControl(el));
      };
      el.addEventListener('input', write);
      el.addEventListener('change', write);
    });
    appEl.querySelectorAll('[data-fill]').forEach((el) => {
      el.addEventListener('change', () => {
        if (!el.value) return;
        const input = appEl.querySelector('[data-bind="' + CSS.escape(el.dataset.fill) + '"]');
        if (input) input.value = el.value;
        if (state.draft && state.draftSection) setPath(state.draft, el.dataset.fill, el.value);
      });
    });
    appEl.querySelectorAll('[data-add]').forEach((button) => button.addEventListener('click', () => {
      const rule = fieldAt(button.dataset.add);
      getPath(state.draft, button.dataset.add).push(blankFrom(rule));
      render();
    }));
    appEl.querySelectorAll('[data-remove]').forEach((button) => button.addEventListener('click', () => {
      const parts = button.dataset.remove.split('.');
      const index = Number(parts.pop());
      getPath(state.draft, parts.join('.')).splice(index, 1);
      render();
    }));
    const sectionForm = document.getElementById('section-form');
    if (sectionForm) {
      sectionForm.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        try {
          await api('/api/admin/site/' + state.section, { method: 'PUT', body: state.draft });
          state.site[state.section] = JSON.parse(JSON.stringify(state.draft));
          state.ok = '已保存，刷新网站即可看到。';
          state.error = '';
          render();
        } catch (error) {
          state.error = error.message;
          state.details = error.details;
          render();
        }
      });
    }
    appEl.querySelectorAll('[data-move]').forEach((button) => button.addEventListener('click', async () => {
      const collection = button.dataset.move;
      const listName = ['brands', 'landmarks', 'regions'].includes(collection) ? 'clients' : 'catalog';
      const list = sorted(state[listName][collection]);
      const index = Number(button.dataset.index);
      const dir = Number(button.dataset.dir);
      const next = list.slice();
      const [row] = next.splice(index, 1);
      next.splice(index + dir, 0, row);
      try {
        await api('/api/admin/reorder', { method: 'POST', body: { collection, ids: next.map((item) => item.id) } });
        await loadAll();
        render();
      } catch (error) {
        state.error = error.message;
        render();
      }
    }));
    appEl.querySelectorAll('[data-del]').forEach((button) => button.addEventListener('click', async () => {
      if (!confirm('确定删除？网站上对应的内容会一起消失。')) return;
      try {
        await api('/api/admin/' + button.dataset.del + '/' + encodeURIComponent(button.dataset.id), { method: 'DELETE' });
        await loadAll();
        state.ok = '已删除。';
        render();
      } catch (error) {
        state.error = error.message;
        render();
      }
    }));
    const entity = document.getElementById('entity-form');
    if (entity) {
      const colorSelect = entity.elements.colorId;
      if (colorSelect) colorSelect.addEventListener('change', () => {
        const found = state.catalog.colors.find((item) => item.id === colorSelect.value);
        if (found && entity.elements.color) entity.elements.color.value = found.name;
      });
      entity.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const route = state.route.replace(/^#\//, '').split('/');
        const kind = route[0];
        const id = decodeURIComponent(route[1] || '');
        const data = formData(entity);
        const map = { category: 'categories', product: 'products', color: 'colors', scene: 'scenes', brand: 'brands', landmark: 'landmarks' };
        try {
          const imageValue = (entity.querySelector('[data-bind="image"]') || {}).value || '';
          if (kind === 'category') {
            await saveEntity('categories', id, { id: data.id || id, name: data.name, en: data.en, image: imageValue, description: data.description, sort: Number(data.sort || 0), enabled: !!data.enabled });
          } else if (kind === 'product') {
            const image = imageValue;
            await saveEntity('products', id, { id: data.id || id, category: data.category, name: data.name, image, unit: data.unit, material: data.material, intro: data.intro, options: lines(data.options), optionLabel: data.optionLabel, color: data.color, colorId: data.colorId, sort: Number(data.sort || 0), enabled: !!data.enabled });
          } else if (kind === 'color') {
            await saveEntity('colors', id, { id: data.id || id, name: data.name, hex: data.hex, use: data.use, sort: Number(data.sort || 0) });
          } else if (kind === 'scene') {
            await saveEntity('scenes', id, { id: data.id || id, name: data.name, image: imageValue, title: data.title, desc: data.desc, focus: lines(data.focus), selection: data.selection || [], brief: data.brief, palette: data.palette, sort: Number(data.sort || 0), enabled: !!data.enabled });
          } else if (kind === 'brand') {
            await saveEntity('brands', id, { id: data.id || id, name: data.name, cn: data.cn, logo: data.logo, ar: data.ar, sort: Number(data.sort || 0) });
          } else if (kind === 'landmark') {
            await saveEntity('landmarks', id, { id: data.id || id, name: data.name, en: data.en, city: data.city, sort: Number(data.sort || 0) });
          }
          if (map[kind]) location.hash = '#/' + map[kind];
        } catch (error) {
          state.error = error.message;
          state.details = error.details;
          render();
        }
      });
    }
    const regionForm = document.getElementById('region-form');
    if (regionForm) {
      regionForm.addEventListener('input', (ev) => {
        const el = ev.target;
        if (el.name === 'name') state.draft.name = el.value;
        if (el.name === 'id') state.draft.id = el.value;
        if (el.name === 'sort') state.draft.sort = Number(el.value);
        if (el.dataset.hotel) {
          const hotel = state.draft.hotels[Number(el.dataset.index)];
          hotel[el.dataset.hotel] = el.dataset.hotel === 'stars' ? Number(el.value) : el.value;
        }
      });
      document.getElementById('add-hotel').addEventListener('click', () => {
        state.draft.hotels.push({ name: '', stars: 5 });
        render();
      });
      appEl.querySelectorAll('[data-hotel-remove]').forEach((button) => button.addEventListener('click', () => {
        state.draft.hotels.splice(Number(button.dataset.hotelRemove), 1);
        render();
      }));
      regionForm.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const id = decodeURIComponent(state.route.split('/')[1] || '');
        const creating = id === 'new';
        try {
          await api('/api/admin/regions' + (creating ? '' : '/' + encodeURIComponent(id)), { method: creating ? 'POST' : 'PUT', body: state.draft });
          await loadAll();
          state.draftKind = '';
          state.ok = '已保存。';
          location.hash = '#/regions';
        } catch (error) {
          state.error = error.message;
          state.details = error.details;
          render();
        }
      });
    }
    const sourceForm = document.getElementById('source-form');
    if (sourceForm) sourceForm.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      try {
        await api('/api/admin/clients/source', { method: 'PUT', body: { source: sourceForm.elements.source.value } });
        await loadAll();
        state.ok = '已保存来源说明。';
        render();
      } catch (error) {
        state.error = error.message;
        render();
      }
    });
    const upload = document.getElementById('upload-form');
    if (upload) upload.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const body = new FormData();
      body.append('alt', upload.elements.alt.value);
      body.append('file', upload.elements.file.files[0]);
      try {
        await api('/api/admin/media', { method: 'POST', body });
        await loadAll();
        state.ok = '已上传。';
        render();
      } catch (error) {
        state.error = error.message;
        render();
      }
    });
    appEl.querySelectorAll('[data-media]').forEach((button) => button.addEventListener('click', async () => {
      if (!confirm('删除这张已上传的图片？')) return;
      await api('/api/admin/media/' + encodeURIComponent(button.dataset.media), { method: 'DELETE' });
      await loadAll();
      render();
    }));
    appEl.querySelectorAll('[data-inquiry]').forEach((button) => button.addEventListener('click', async () => {
      if (!confirm('删除这条询盘？')) return;
      await api('/api/admin/inquiries/' + encodeURIComponent(button.dataset.inquiry), { method: 'DELETE' });
      await loadAll();
      render();
    }));
    const password = document.getElementById('password-form');
    if (password) password.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      try {
        await api('/api/admin/password', { method: 'PUT', body: formData(password) });
        state.ok = '密码已更新。';
        state.error = '';
        render();
      } catch (error) {
        state.error = error.message;
        state.details = error.details;
        render();
      }
    });
  }

  window.addEventListener('hashchange', () => {
    state.route = location.hash || '#/dashboard';
    state.error = '';
    state.ok = '';
    state.details = [];
    if (!state.route.startsWith('#/site/')) state.draftSection = '';
    if (!state.route.startsWith('#/region/')) state.draftKind = '';
    render();
  });

  boot();
})();
