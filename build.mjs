import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const head = read('src/head.html');
const body = read('src/body.html');
const js = read('src/game.js');

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
${head}
</head>
<body>
${body}
<script>
${js}
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(root, 'index.html'), html, 'utf8');
const kb = (Buffer.byteLength(html, 'utf8') / 1024).toFixed(1);
console.log('built index.html — ' + kb + ' KB, ' + html.split('\n').length + ' lines');
