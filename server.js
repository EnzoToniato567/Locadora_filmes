/**
 * server.js — Servidor local AnimeHouse
 * =======================================
 * Inicie com:  node server.js
 * Acesse em:   http://localhost:3000
 *
 * Usa apenas módulos nativos do Node.js (sem npm install).
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');
const url  = require('url');

const PORT      = 3000;
const ROOT      = __dirname;
const DATA_FILE = path.join(ROOT, 'data.json');

/* ── MIME types ── */
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css' : 'text/css',
  '.js'  : 'application/javascript',
  '.json': 'application/json',
  '.png' : 'image/png',
  '.jpg' : 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif' : 'image/gif',
  '.ico' : 'image/x-icon',
  '.svg' : 'image/svg+xml',
  '.webp': 'image/webp',
};

/* ── Helpers ── */
function sendJSON(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Content-Length': Buffer.byteLength(body)
  });
  res.end(body);
}

function readData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return { cartoons: [], episodes: {}, animes: [], animeEpisodes: {}, mangas: [] };
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function getBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end',  () => { try { resolve(JSON.parse(body)); } catch { reject(new Error('JSON inválido')); } });
    req.on('error', reject);
  });
}

/* ── Servidor ── */
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname  = parsedUrl.pathname;

  /* ── CORS preflight ── */
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST', 'Access-Control-Allow-Headers': 'Content-Type' });
    return res.end();
  }

  /* ── API: GET /api/data ── */
  if (req.method === 'GET' && pathname === '/api/data') {
    return sendJSON(res, 200, readData());
  }

  /* ── API: POST /api/save ── */
  if (req.method === 'POST' && pathname === '/api/save') {
    try {
      const body = await getBody(req);
      writeData(body);
      return sendJSON(res, 200, { ok: true });
    } catch (e) {
      return sendJSON(res, 400, { error: e.message });
    }
  }

  /* ── Arquivos estáticos ── */
  let filePath = path.join(ROOT, pathname === '/' ? 'index.html' : pathname);

  // Segurança: não sair da pasta raiz
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403); return res.end('Proibido');
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('Arquivo não encontrado: ' + pathname);
    }
    const ext  = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'no-cache' });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════╗');
  console.log('  ║   🎬  AnimeHouse — Servidor local    ║');
  console.log('  ╠══════════════════════════════════════╣');
  console.log(`  ║   Acesse: http://localhost:${PORT}       ║`);
  console.log('  ║   Para parar: Ctrl + C               ║');
  console.log('  ╚══════════════════════════════════════╝');
  console.log('');
});
