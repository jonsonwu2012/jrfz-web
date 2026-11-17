const { createApp } = require('./app');

const weakSecrets = new Set(['dev-only-session-secret', 'please-change-this-session-secret', 'change-me', 'secret']);
if (process.env.NODE_ENV === 'production') {
  const secret = process.env.SESSION_SECRET || '';
  if (!secret || weakSecrets.has(secret) || secret.length < 24) {
    console.error('[junrong] 生产环境必须设置至少 24 位的 SESSION_SECRET，且不能使用示例值。');
    process.exit(1);
  }
}

const port = Number(process.env.PORT || 8080);
const host = process.env.HOST || '0.0.0.0';
const { app } = createApp({
  syncRoot: process.env.SYNC_ROOT !== '0',
  seedDir: process.env.SEED_DIR || undefined
});

app.listen(port, host, () => {
  const shown = host === '0.0.0.0' ? '127.0.0.1' : host;
  console.log('君荣纺织内容管理已启动');
  console.log('网站  http://' + shown + ':' + port + '/');
  console.log('后台  http://' + shown + ':' + port + '/admin');
});
