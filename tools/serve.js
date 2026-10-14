#!/usr/bin/env node
/* 本地小服务器：node tools/serve.js [端口]
 * 口语关要用麦克风。直接双击 index.html（file://）时，浏览器每次都会重新询问麦克风权限；
 * 通过 http://localhost 打开就只问一次。这个脚本只在本机（127.0.0.1）提供当前文件夹里的文件，不联网。 */
const http = require('http'), fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..'), port = +process.argv[2] || 8777;
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.md': 'text/plain; charset=utf-8' };
http.createServer((req, res) => {
  let p;
  try { p = decodeURIComponent(req.url.split('?')[0]); } catch (e) { res.writeHead(400); return res.end('bad request'); }
  if (p === '/') p = '/index.html';
  const file = path.join(root, path.normalize(p));
  if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403); return res.end('forbidden'); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('not found'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  });
}).listen(port, '127.0.0.1', () => console.log('单词魔境已启动： http://localhost:' + port + '/   （按 Ctrl + C 停止）'))
  .on('error', (e) => { console.error(e.code === 'EADDRINUSE' ? '端口 ' + port + ' 已被占用：可能已经启动过了，直接打开 http://localhost:' + port + '/ 即可。' : String(e)); process.exit(1); });
