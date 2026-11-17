const path = require('path');
const { createStore } = require('./store');
const { build, ROOT } = require('./publish');

const contentDir = path.join(ROOT, 'content');
const store = createStore(contentDir);
store.ensure(contentDir);
const outIndex = process.argv.indexOf('--out');
const outDir = outIndex >= 0 ? path.resolve(process.argv[outIndex + 1]) : path.join(ROOT, 'dist');
build({ store, outDir, mode: 'static', copyStatic: true });
console.log('静态网站已生成：' + outDir);
