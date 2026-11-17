const crypto = require('crypto');
const fs = require('fs');
const { HttpError } = require('./errors');

const SESSION_MS = 7 * 24 * 60 * 60 * 1000;

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 32).toString('hex');
  return { salt, hash };
}

function verifyPassword(password, salt, hash) {
  const next = crypto.scryptSync(password, salt, 32);
  const prev = Buffer.from(hash, 'hex');
  if (next.length !== prev.length) return false;
  return crypto.timingSafeEqual(next, prev);
}

function sign(payload, secret) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const mac = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  return body + '.' + mac;
}

function verifyToken(token, secret, expectedVersion) {
  if (!token || !token.includes('.')) return null;
  const [body, mac] = token.split('.');
  const expected = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (!payload || typeof payload.exp !== 'number' || payload.exp < Date.now()) return null;
    if (typeof payload.u !== 'string') return null;
    if (expectedVersion != null && payload.v !== expectedVersion) return null;
    return payload;
  } catch {
    return null;
  }
}

function ensureAuth(contentDir, env = process.env) {
  const file = require('path').join(contentDir, 'auth.json');
  if (!fs.existsSync(file)) {
    const username = env.ADMIN_USERNAME || 'admin';
    const password = env.ADMIN_PASSWORD || 'junrong-admin';
    const { salt, hash } = hashPassword(password);
    const data = {
      tokenVersion: 1,
      sessionSecret: crypto.randomBytes(32).toString('hex'),
      users: [{ id: 'admin', username, salt, hash, role: 'admin' }]
    };
    fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
    if (!env.ADMIN_PASSWORD) {
      console.warn('[junrong] 未设置 ADMIN_PASSWORD，已使用默认密码 junrong-admin。请尽快在后台修改。');
    }
    return;
  }
  const data = readUsers(contentDir);
  let changed = false;
  if (!data.tokenVersion) {
    data.tokenVersion = 1;
    changed = true;
  }
  if (!data.sessionSecret) {
    data.sessionSecret = crypto.randomBytes(32).toString('hex');
    changed = true;
  }
  if (changed) writeUsers(contentDir, data);
}

function tokenVersion(contentDir) {
  return readUsers(contentDir).tokenVersion || 1;
}

function resolveSecret(contentDir) {
  const envSecret = process.env.SESSION_SECRET || '';
  const weak = new Set(['dev-only-session-secret', 'please-change-this-session-secret', 'change-me', 'secret']);
  if (envSecret && !weak.has(envSecret) && envSecret.length >= 24) return envSecret;
  return readUsers(contentDir).sessionSecret;
}

function readUsers(contentDir) {
  return JSON.parse(fs.readFileSync(require('path').join(contentDir, 'auth.json'), 'utf8'));
}

function writeUsers(contentDir, data) {
  const dest = require('path').join(contentDir, 'auth.json');
  const tmp = dest + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n');
  fs.renameSync(tmp, dest);
}

function login(contentDir, username, password, secret) {
  const data = readUsers(contentDir);
  const user = data.users.find((item) => item.username === username);
  if (!user || !verifyPassword(password, user.salt, user.hash)) {
    throw new HttpError(401, '用户名或密码不正确');
  }
  const token = sign({ u: user.username, role: user.role, v: data.tokenVersion || 1, exp: Date.now() + SESSION_MS }, secret);
  return { token, user: { username: user.username, role: user.role } };
}

function changePassword(contentDir, username, currentPassword, newPassword) {
  const data = readUsers(contentDir);
  const user = data.users.find((item) => item.username === username);
  if (!user || !verifyPassword(currentPassword, user.salt, user.hash)) {
    throw new HttpError(400, '当前密码不正确');
  }
  const { salt, hash } = hashPassword(newPassword);
  user.salt = salt;
  user.hash = hash;
  data.tokenVersion = (data.tokenVersion || 1) + 1;
  writeUsers(contentDir, data);
  return data.tokenVersion;
}

module.exports = {
  hashPassword,
  verifyPassword,
  sign,
  verifyToken,
  ensureAuth,
  login,
  changePassword,
  tokenVersion,
  resolveSecret,
  SESSION_MS
};
