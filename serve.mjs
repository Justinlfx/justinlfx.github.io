import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = dirname(fileURLToPath(import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml' };
const publicFiles = new Set(['/index.html','/styles.css','/app.js','/config.js','/booking-utils.js','/favicon.svg']);
http.createServer(async (req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch { res.writeHead(400).end(); return; }
  if (pathname === '/') pathname = '/index.html';
  if (!publicFiles.has(pathname)) { res.writeHead(404).end('Not found'); return; }
  try {
    const body = await readFile(resolve(root, '.' + pathname));
    res.writeHead(200, { 'content-type': types[extname(pathname)] || 'application/octet-stream', 'cache-control':'no-store', 'x-content-type-options':'nosniff' }).end(body);
  } catch { res.writeHead(404).end('Not found'); }
}).listen(4173, '127.0.0.1', () => console.log('Local: http://127.0.0.1:4173'));
