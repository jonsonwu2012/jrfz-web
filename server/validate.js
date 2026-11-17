const { HttpError } = require('./errors');

function fail(message, details) {
  throw new HttpError(400, message || '填写内容未通过校验', details || null);
}

function isObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function cleanString(value, path, { max = 500, required = false } = {}) {
  if (value == null) {
    if (required) fail('请完整填写', [{ path, message: '必填' }]);
    return '';
  }
  if (typeof value !== 'string') fail('字段格式不正确', [{ path, message: '应为文本' }]);
  const s = value.replace(/\u0000/g, '').trim();
  if (!s && required) fail('请完整填写', [{ path, message: '必填' }]);
  if (s.length > max) fail('内容过长', [{ path, message: '最多 ' + max + ' 个字符' }]);
  return s;
}

function cleanSlug(value, path, { required = true } = {}) {
  const s = cleanString(value, path, { max: 48, required });
  if (!s && !required) return '';
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s)) {
    fail('标识格式不正确', [{ path, message: '请使用小写英文、数字和短横线' }]);
  }
  return s;
}

function cleanHex(value, path) {
  const s = cleanString(value, path, { max: 9, required: true });
  if (!/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(s)) {
    fail('颜色格式不正确', [{ path, message: '请使用 #RGB 或 #RRGGBB' }]);
  }
  return s.toUpperCase() === s ? s : s;
}

function cleanHref(value, path, { required = true } = {}) {
  const s = cleanString(value, path, { max: 300, required });
  if (!s && !required) return '';
  if (s.startsWith('#/') || s === '#/') return s;
  if (s === '#') return s;
  if (/^(mailto:|tel:)[^\s]+$/i.test(s)) return s;
  if (/^https:\/\/[^\s]+$/i.test(s)) return s;
  if (!s.includes('..') && !s.includes('\\') && !s.includes('://') && /^[\w./\u4e00-\u9fff%\-]+\.html(?:\?[\w=&%\-.]*)?$/.test(s)) return s;
  if (!s.includes('..') && !s.includes('\\') && /^[\w./\u4e00-\u9fff%\-]+$/.test(s) && !s.startsWith('/')) return s;
  fail('链接格式不正确', [{ path, message: '请使用站内路径、#/ 锚点、mailto、tel 或 https 链接' }]);
}

function cleanImage(value, path, { required = true } = {}) {
  const s = cleanString(value, path, { max: 200, required });
  if (!s && !required) return '';
  if (s.includes('..') || s.includes('\\') || s.includes('?') || /\s/.test(s)) {
    fail('图片路径不正确', [{ path, message: '路径无效' }]);
  }
  if (/^[A-Za-z0-9_-]{1,80}$/.test(s)) return s;
  if (/^(assets|uploads)\/[A-Za-z0-9_./-]+\.(webp|svg|png|jpe?g|gif)$/i.test(s)) return s;
  fail('图片路径不正确', [{ path, message: '请填写资源键（如 bed-1）或 assets/、uploads/ 下的图片' }]);
}

function cleanInt(value, path, { min = 0, max = 1000000, fallback = 0, required = false } = {}) {
  if (value == null || value === '') {
    if (required) fail('请填写数字', [{ path, message: '必填' }]);
    return fallback;
  }
  const n = typeof value === 'number' ? value : Number(String(value).trim());
  if (!Number.isInteger(n) || n < min || n > max) {
    fail('数字超出范围', [{ path, message: '应为 ' + min + ' 到 ' + max + ' 的整数' }]);
  }
  return n;
}

function cleanBool(value) {
  return value !== false && value !== 'false' && value !== 0;
}

function cleanStringList(value, path, { min = 0, max = 20, itemMax = 200, required = false } = {}) {
  if (value == null) {
    if (required || min > 0) fail('请填写列表', [{ path, message: '至少 ' + min + ' 项' }]);
    return [];
  }
  if (!Array.isArray(value)) fail('列表格式不正确', [{ path, message: '应为数组' }]);
  if (value.length < min) fail('项目过少', [{ path, message: '至少 ' + min + ' 项' }]);
  if (value.length > max) fail('项目过多', [{ path, message: '最多 ' + max + ' 项' }]);
  return value.map((item, i) => cleanString(item, path + '[' + i + ']', { max: itemMax, required: true }));
}

function cleanObjectList(value, path, rule) {
  if (value == null) {
    if ((rule.min || 0) > 0) fail('请填写列表', [{ path, message: '至少 ' + rule.min + ' 项' }]);
    return [];
  }
  if (!Array.isArray(value)) fail('列表格式不正确', [{ path, message: '应为数组' }]);
  const min = rule.min || 0;
  const max = rule.max || 50;
  if (value.length < min) fail('项目过少', [{ path, message: '至少 ' + min + ' 项' }]);
  if (value.length > max) fail('项目过多', [{ path, message: '最多 ' + max + ' 项' }]);
  return value.map((item, i) => cleanFields(item, rule.fields, path + '[' + i + ']'));
}

function applyRule(value, path, rule) {
  switch (rule.type) {
    case 'string':
    case 'rich':
      return cleanString(value, path, rule);
    case 'slug':
      return cleanSlug(value, path, rule);
    case 'hex':
      return cleanHex(value, path);
    case 'href':
      return cleanHref(value, path, rule);
    case 'image':
      return cleanImage(value, path, rule);
    case 'int':
      return cleanInt(value, path, rule);
    case 'bool':
      return value == null ? rule.fallback !== false : cleanBool(value);
    case 'stringList':
      return cleanStringList(value, path, rule);
    case 'objectList':
      return cleanObjectList(value, path, rule);
    default:
      fail('内部校验配置错误');
  }
}

function cleanFields(body, fields, prefix) {
  if (!isObject(body)) fail('请求格式不正确', [{ path: prefix || '', message: '应为对象' }]);
  const out = {};
  for (const [key, rule] of Object.entries(fields)) {
    const path = prefix ? prefix + '.' + key : key;
    out[key] = applyRule(body[key], path, rule);
  }
  return out;
}

const link = { type: 'href', required: true, max: 300 };
const text = (max, required = true) => ({ type: 'string', max, required });
const rich = (max) => ({ type: 'rich', max, required: true });
const lines = (min, max, itemMax) => ({ type: 'stringList', min, max, itemMax, required: min > 0 });
const steps = { type: 'objectList', min: 1, max: 8, fields: { title: text(40), text: text(80) } };
const points = lines(1, 8, 120);

const SECTION_SCHEMAS = {
  seo: {
    title: text(120),
    description: text(300),
    themeColor: { type: 'hex' },
    titleSuffix: text(80)
  },
  contact: {
    phone: text(40, false),
    email: text(120, false),
    address: text(200, false),
    hours: text(80, false)
  },
  chrome: {
    skipLink: text(40),
    quoteNav: text(20),
    headerCta: text(20),
    menuOpen: text(20),
    footerTaglineHtml: rich(200),
    footerCompany: text(80),
    footerCopyright: text(80),
    footerDisclaimer: text(120),
    navigation: {
      type: 'objectList', min: 1, max: 12,
      fields: { id: { type: 'slug' }, label: text(20), href: link }
    },
    footerLinks: {
      type: 'objectList', min: 0, max: 8,
      fields: { label: text(40), href: link }
    }
  },
  shared: {
    ctaTitle: text(80),
    ctaButton: text(40),
    processEyeline: text(60),
    processTitleHtml: rich(120),
    processIntro: text(200),
    processSteps: steps
  },
  home: {
    pageTitle: text(80),
    heroTitleHtml: rich(160),
    heroTextHtml: rich(240),
    heroPrimary: text(40),
    heroPrimaryHref: link,
    heroSecondary: text(40),
    heroSecondaryHref: link,
    heroSignature: text(120),
    heroImage: { type: 'image' },
    heroImageAlt: text(120),
    categoryStrip: {
      type: 'objectList', min: 1, max: 6,
      fields: { href: link, label: text(20), en: text(40) }
    },
    collectionEyeline: text(60),
    collectionTitle: text(80),
    collectionLink: text(40),
    collectionTailLeft: text(80),
    collectionTailRight: text(80),
    clientsEyeline: text(60),
    clientsTitleHtml: rich(120),
    clientsLink: text(40),
    clientsHighlights: text(200),
    clientsTail: text(200),
    sceneTitleHtml: rich(120),
    sceneText: text(240),
    sceneCta: text(40),
    sceneCaption: text(80),
    sceneTabsLabel: text(40),
    paletteEyeline: text(80),
    paletteTitle: text(80),
    paletteLink: text(40),
    paletteLinkHref: link,
    paletteIntro: text(240),
    paletteNote: text(300),
    brandWallLimit: { type: 'int', min: 1, max: 24, fallback: 10, required: true }
  },
  catalog: {
    pageTitle: text(40),
    headingHtml: rich(160),
    intro: text(160),
    allLabel: text(20),
    searchPlaceholder: text(40),
    searchLabel: text(40),
    materialLabel: text(20),
    materialAll: text(20),
    colorLabel: text(20),
    colorAll: text(20),
    metaNote: text(120),
    countSuffix: text(20),
    emptyTitle: text(40),
    emptyText: text(120),
    clearFilters: text(20),
    cardDetail: text(20),
    menuLabel: text(20)
  },
  detail: {
    photoAltSuffix: text(40),
    photoNote: text(120),
    materialLabel: text(20),
    materialSuffix: text(40),
    colorLabel: text(20),
    colorSuffix: text(40),
    seriesLabel: text(20),
    specLabel: text(20),
    specValue: text(80),
    priceLabel: text(20),
    priceValue: text(80),
    qtyLabel: text(40),
    addButton: text(20),
    sampleButton: text(20),
    note: text(120),
    sizeNoteBed: text(120),
    sizeNoteCore: text(120),
    sizeNoteDefault: text(120),
    tabsLabel: text(20),
    tabs: {
      type: 'objectList', min: 1, max: 6,
      fields: { id: { type: 'slug' }, label: text(20) }
    },
    descriptionSuffix: text(200),
    descriptionSeries: text(200),
    specsBody: text(240),
    specsBody2: text(300),
    careBody: text(240),
    careBody2: text(300),
    crumbHome: text(20),
    crumbProducts: text(20),
    optionsLabel: text(20),
    defaultOption: text(40)
  },
  solutions: {
    pageTitle: text(40),
    headingHtml: rich(160),
    intro: text(200),
    tabsLabel: text(40),
    photoAltSuffix: text(40),
    caption: text(80),
    eyelineSuffix: text(40),
    paletteNote: text(200),
    projectButton: text(40),
    projectNote: text(120),
    selectionTitle: text(80),
    selectionLink: text(40)
  },
  custom: {
    pageTitle: text(40),
    headingHtml: rich(160),
    intro: text(200),
    eyeline: text(60),
    titleHtml: rich(120),
    body: text(500),
    note: text(300),
    services: { type: 'objectList', min: 1, max: 8, fields: { title: text(40), text: text(200) } }
  },
  about: {
    pageTitle: text(40),
    eyeline: text(60),
    title: text(40),
    lead: text(300),
    body: text(400),
    signature: text(120),
    heroImage: { type: 'image' },
    heroImageAlt: text(120),
    statClients: text(40),
    statFive: text(40),
    statBrands: text(40),
    statCategories: text(40),
    philosophyEyeline: text(80),
    philosophyTitleHtml: rich(160),
    philosophy: lines(1, 6, 400),
    standardEyeline: text(80),
    standardTitleHtml: rich(160),
    pillars: {
      type: 'objectList', min: 1, max: 6,
      fields: { title: text(20), en: text(40), lead: text(80), points: points }
    },
    proofEyeline: text(80),
    proofTitleHtml: rich(120),
    proofBody: text(400),
    proofImage: { type: 'image' },
    proofImageAlt: text(120),
    proofButton: text(40),
    workEyeline: text(80),
    workTitleHtml: rich(120),
    workIntro: text(160),
    steps: { type: 'objectList', min: 1, max: 8, fields: { title: text(40), text: text(80) } },
    factoryLink: text(40),
    note: text(300)
  },
  factory: {
    pageTitle: text(40),
    eyeline: text(60),
    titleHtml: rich(120),
    lead: text(300),
    steps: {
      type: 'objectList', min: 1, max: 8,
      fields: {
        image: { type: 'image' },
        title: text(40),
        en: text(40),
        lead: text(80),
        body: text(400),
        points: points,
        caption: text(80)
      }
    },
    footEyeline: text(80),
    footTitleHtml: rich(120),
    footBody: text(240),
    footButton: text(40),
    note: text(240)
  },
  clientsPage: {
    pageTitle: text(40),
    headingHtml: rich(160),
    intro: text(200),
    statClients: text(40),
    statFive: text(40),
    statBrands: text(40),
    statRegions: text(80),
    brandsEyeline: text(60),
    brandsTitle: text(40),
    landmarksEyeline: text(60),
    landmarksTitle: text(40),
    landmarksNote: text(120),
    directoryEyeline: text(60),
    directoryTitle: text(40),
    countLabel: text(40),
    regionCount: text(20),
    regionAll: text(20),
    starsAll: text(20),
    starsFive: text(20),
    starsFour: text(20),
    starsThree: text(20),
    searchPlaceholder: text(40),
    searchLabel: text(20),
    empty: text(80),
    clear: text(20),
    regionLabel: text(20),
    starsLabel: text(20),
    note: text(500)
  },
  inquiry: {
    pageTitle: text(40),
    headingHtml: rich(160),
    intro: text(160),
    formTitle: text(40),
    organizationLabel: text(40),
    organizationPlaceholder: text(40),
    contactLabel: text(40),
    contactPlaceholder: text(40),
    phoneLabel: text(40),
    phonePlaceholder: text(40),
    projectTypeLabel: text(40),
    projectTypes: lines(1, 12, 40),
    roomsLabel: text(40),
    roomsPlaceholder: text(20),
    deliveryLabel: text(40),
    notesLabel: text(40),
    notesPlaceholder: text(80),
    consent: text(120),
    submit: text(40),
    localNoteHtml: rich(240),
    serverNoteHtml: rich(240),
    sendFailed: text(120),
    successTitle: text(40),
    successBody: text(240),
    sentTitle: text(40),
    sentBody: text(240),
    download: text(40),
    edit: text(20),
    quoteHeading: text(20),
    quoteNote: text(120),
    emptyText: text(160),
    browse: text(20),
    totalNote: text(120),
    sampleIntent: text(10),
    buyIntent: text(10)
  },
  notFound: {
    pageTitle: text(40),
    title: text(40),
    text: text(80),
    button: text(20)
  },
  toasts: {
    added: text(80),
    sample: text(80),
    removed: text(40)
  },
  receipt: {
    title: text(80),
    banner: text(240),
    sentBanner: text(240),
    needsHeading: text(40),
    itemsHeading: text(40),
    emptyItems: text(80),
    pendingHeading: text(40),
    pending: lines(1, 8, 80),
    privacy: text(160),
    filename: text(80),
    pendingValue: text(20),
    fields: {
      type: 'objectList',
      min: 1,
      max: 1,
      fields: {}
    }
  }
};

// receipt.fields is an object, not a list. Handle it outside the generic rule.
delete SECTION_SCHEMAS.receipt.fields;

const RECEIPT_FIELDS = {
  organization: text(40),
  contact: text(40),
  phone: text(40),
  projectType: text(40),
  rooms: text(40),
  delivery: text(40),
  notes: text(40)
};

function cleanSection(name, body) {
  const schema = SECTION_SCHEMAS[name];
  if (!schema) fail('未知的内容分区');
  const cleaned = cleanFields(body, schema);
  if (name === 'contact' && cleaned.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned.email)) {
    fail('邮箱格式不正确', [{ path: 'email', message: '请填写有效邮箱' }]);
  }
  if (name === 'receipt') {
    cleaned.fields = cleanFields(body && body.fields, RECEIPT_FIELDS, 'fields');
    if (!/^[^\\/:*?"<>|]+\.md$/.test(cleaned.filename)) {
      fail('文件名不正确', [{ path: 'filename', message: '请使用以 .md 结尾的文件名' }]);
    }
  }
  return cleaned;
}

function cleanCategory(body) {
  const row = cleanFields(body, {
    id: { type: 'slug' },
    name: text(40),
    en: text(40),
    image: { type: 'image' },
    description: text(80),
    sort: { type: 'int', min: 0, max: 100000, fallback: 0 },
    enabled: { type: 'bool', fallback: true }
  });
  return row;
}

function cleanProduct(body) {
  return cleanFields(body, {
    id: { type: 'slug' },
    category: { type: 'slug' },
    name: text(80),
    image: { type: 'image' },
    unit: text(8),
    material: text(40),
    intro: text(300),
    options: lines(1, 12, 40),
    optionLabel: text(20),
    color: text(20),
    colorId: { type: 'slug' },
    sort: { type: 'int', min: 0, max: 100000, fallback: 0 },
    enabled: { type: 'bool', fallback: true }
  });
}

function cleanColor(body) {
  return cleanFields(body, {
    id: { type: 'slug' },
    name: text(20),
    hex: { type: 'hex' },
    use: text(40),
    sort: { type: 'int', min: 0, max: 100000, fallback: 0 }
  });
}

function cleanScene(body) {
  return cleanFields(body, {
    id: { type: 'slug' },
    name: text(40),
    image: { type: 'image' },
    title: text(80),
    desc: text(300),
    focus: lines(1, 8, 40),
    selection: lines(1, 12, 48),
    brief: text(400),
    palette: text(20),
    sort: { type: 'int', min: 0, max: 100000, fallback: 0 },
    enabled: { type: 'bool', fallback: true }
  });
}

function cleanBrand(body) {
  if (!isObject(body)) fail('请求格式不正确');
  let ar = 0;
  if (body.ar != null && body.ar !== '') {
    const n = Number(body.ar);
    if (!Number.isFinite(n) || n < 0 || n >= 100) {
      fail('宽高比不正确', [{ path: 'ar', message: '请填写 0 到 100 之间的数字' }]);
    }
    ar = Math.round(n * 1000) / 1000;
  }
  const row = cleanFields(body, {
    id: { type: 'slug' },
    name: text(80),
    cn: text(40),
    logo: { type: 'image', required: false },
    sort: { type: 'int', min: 0, max: 100000, fallback: 0 }
  });
  row.ar = ar;
  return row;
}

function cleanLandmark(body) {
  return cleanFields(body, {
    id: { type: 'slug' },
    name: text(80),
    en: text(120),
    city: text(20, false),
    sort: { type: 'int', min: 0, max: 100000, fallback: 0 }
  });
}

function cleanHotel(hotel, path) {
  if (!isObject(hotel)) fail('酒店格式不正确', [{ path, message: '应为对象' }]);
  return {
    name: cleanString(hotel.name, path + '.name', { max: 80, required: true }),
    stars: cleanInt(hotel.stars, path + '.stars', { min: 1, max: 5, required: true })
  };
}

function cleanRegion(body) {
  const base = cleanFields(body, {
    id: { type: 'slug' },
    name: text(20),
    sort: { type: 'int', min: 0, max: 100000, fallback: 0 }
  });
  if (!Array.isArray(body.hotels)) fail('请提供酒店列表', [{ path: 'hotels', message: '应为数组' }]);
  if (body.hotels.length > 500) fail('酒店过多', [{ path: 'hotels', message: '最多 500 家' }]);
  base.hotels = body.hotels.map((hotel, i) => cleanHotel(hotel, 'hotels[' + i + ']'));
  return base;
}

function cleanInquiry(body, projectTypes) {
  if (!isObject(body)) fail('请求格式不正确');
  const organization = cleanString(body.organization, 'organization', { max: 200, required: true });
  const contact = cleanString(body.contact, 'contact', { max: 80, required: true });
  const phone = cleanString(body.phone, 'phone', { max: 30, required: true });
  if (phone.length < 6) fail('电话格式不正确', [{ path: 'phone', message: '至少 6 位' }]);
  const projectType = cleanString(body.projectType, 'projectType', { max: 40, required: true });
  if (Array.isArray(projectTypes) && projectTypes.length && !projectTypes.includes(projectType)) {
    fail('项目类型不正确', [{ path: 'projectType', message: '请选择列表中的类型' }]);
  }
  let rooms = '';
  if (body.rooms != null && String(body.rooms).trim() !== '') {
    rooms = String(cleanInt(body.rooms, 'rooms', { min: 1, max: 100000, required: true }));
  }
  let delivery = cleanString(body.delivery, 'delivery', { max: 20, required: false });
  if (delivery && !/^\d{4}-\d{2}-\d{2}$/.test(delivery)) {
    fail('日期格式不正确', [{ path: 'delivery', message: '请使用 YYYY-MM-DD' }]);
  }
  const notes = cleanString(body.notes, 'notes', { max: 3000, required: false });
  if (!Array.isArray(body.items)) fail('选型格式不正确', [{ path: 'items', message: '应为数组' }]);
  if (body.items.length > 100) fail('选型过多', [{ path: 'items', message: '最多 100 项' }]);
  const items = body.items.map((item, i) => {
    if (!isObject(item)) fail('选型格式不正确', [{ path: 'items[' + i + ']', message: '应为对象' }]);
    const intent = cleanString(item.intent, 'items[' + i + '].intent', { max: 10, required: true });
    if (intent !== '样品' && intent !== '采购') fail('选型意向不正确', [{ path: 'items[' + i + '].intent', message: '应为采购或样品' }]);
    return {
      id: cleanSlug(item.id, 'items[' + i + '].id'),
      name: cleanString(item.name, 'items[' + i + '].name', { max: 80, required: true }),
      option: cleanString(item.option, 'items[' + i + '].option', { max: 80, required: true }),
      qty: cleanInt(item.qty, 'items[' + i + '].qty', { min: 1, max: 100000, required: true }),
      unit: cleanString(item.unit, 'items[' + i + '].unit', { max: 8, required: true }),
      intent
    };
  });
  return { organization, contact, phone, projectType, rooms, delivery, notes, items };
}

function cleanPassword(body) {
  if (!isObject(body)) fail('请求格式不正确');
  const currentPassword = cleanString(body.currentPassword, 'currentPassword', { max: 200, required: true });
  const newPassword = cleanString(body.newPassword, 'newPassword', { max: 200, required: true });
  if (newPassword.length < 8) fail('新密码过短', [{ path: 'newPassword', message: '至少 8 位' }]);
  return { currentPassword, newPassword };
}

function cleanMediaMeta(body) {
  if (!isObject(body)) return { alt: '' };
  return { alt: cleanString(body.alt, 'alt', { max: 120, required: false }) };
}

function describeRule(key, rule) {
  if (rule.type === 'objectList') {
    return {
      key,
      type: 'objects',
      fields: Object.entries(rule.fields).map(([child, childRule]) => describeRule(child, childRule))
    };
  }
  if (rule.type === 'stringList') return { key, type: 'lines' };
  if (rule.type === 'bool') return { key, type: 'bool' };
  if (rule.type === 'int') return { key, type: 'int' };
  if (rule.type === 'hex') return { key, type: 'hex' };
  if (rule.type === 'image') return { key, type: 'image' };
  if (rule.type === 'href' || rule.type === 'slug') return { key, type: 'text' };
  if (rule.type === 'rich' || (rule.max || 0) > 140) return { key, type: 'textarea', rich: rule.type === 'rich' };
  return { key, type: 'text' };
}

function describeForAdmin() {
  const sections = {};
  for (const [name, fields] of Object.entries(SECTION_SCHEMAS)) {
    sections[name] = Object.entries(fields).map(([key, rule]) => describeRule(key, rule));
  }
  sections.receipt.push({
    key: 'fields',
    type: 'group',
    fields: Object.entries(RECEIPT_FIELDS).map(([key, rule]) => describeRule(key, rule))
  });
  return sections;
}

module.exports = {
  SECTION_SCHEMAS,
  describeForAdmin,
  cleanSection,
  cleanCategory,
  cleanProduct,
  cleanColor,
  cleanScene,
  cleanBrand,
  cleanLandmark,
  cleanRegion,
  cleanInquiry,
  cleanPassword,
  cleanMediaMeta,
  cleanSlug,
  cleanImage
};
