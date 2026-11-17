const fs = require('fs');
const path = require('path');

const CONTENT_FILES = ['site', 'catalog', 'clients', 'media'];

function createStore(contentDir) {
  function file(name) {
    return path.join(contentDir, name + '.json');
  }

  function read(name) {
    return JSON.parse(fs.readFileSync(file(name), 'utf8'));
  }

  function write(name, data) {
    const dest = file(name);
    const tmp = dest + '.' + process.pid + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n');
    fs.renameSync(tmp, dest);
  }

  function ensure(seedDir) {
    fs.mkdirSync(contentDir, { recursive: true });
    if (!fs.existsSync(file('site')) && seedDir) {
      for (const name of CONTENT_FILES) {
        const from = path.join(seedDir, name + '.json');
        if (!fs.existsSync(file(name)) && fs.existsSync(from)) fs.copyFileSync(from, file(name));
      }
    }
    if (!fs.existsSync(file('media'))) write('media', []);
    if (!fs.existsSync(file('inquiries'))) write('inquiries', []);
    if (!fs.existsSync(file('meta'))) write('meta', { updatedAt: null });
  }

  function touch() {
    write('meta', { updatedAt: new Date().toISOString() });
  }

  return { read, write, ensure, touch, contentDir, file };
}

module.exports = { createStore };
