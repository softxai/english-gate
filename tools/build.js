#!/usr/bin/env node
/* 把整个游戏打包成一个 HTML 文件，方便发给别人或放到任意网页空间。
 * 用法：node tools/build.js        → 生成 dist/english-gate.html
 * 游戏本身不需要构建，直接打开 index.html 就能玩；这个脚本只是可选的"打包"工具。
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

let html = read('index.html');
// 内联样式表
html = html.replace(/<link rel="stylesheet" href="(css\/[^"]+)">/g, (m, href) => '<style>\n' + read(href) + '\n</style>');
// 内联脚本（</script> 需要转义，避免提前结束标签）
html = html.replace(/<script src="(js\/[^"]+)"><\/script>/g, (m, src) => '<script>\n' + read(src).replace(/<\/script/gi, '<\\/script') + '\n</script>');

const out = path.join(root, 'dist');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'english-gate.html'), html);
console.log('已生成 dist/english-gate.html（' + Math.round(html.length / 1024) + ' KB）');
