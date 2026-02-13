import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.WEB_PORT || 4173);

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8'
};

http
  .createServer(async (req, res) => {
    const pathname = req.url === '/' ? '/index.html' : req.url;
    const file = join(root, pathname);
    try {
      const body = await readFile(file);
      res.writeHead(200, { 'content-type': types[extname(file)] || 'text/plain; charset=utf-8' });
      res.end(body);
    } catch {
      res.writeHead(404, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  })
  .listen(port, () => {
    console.log(`Entrustory web running on :${port}`);
  });
