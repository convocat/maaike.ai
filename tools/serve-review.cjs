/**
 * Tiny local server for the link review UI.
 * Usage: node tools/serve-review.cjs
 * Opens http://localhost:3456
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3456;
const ROOT = path.resolve(__dirname, '..');

const MIME = {
    '.html': 'text/html',
    '.json': 'application/json',
    '.js': 'application/javascript',
    '.css': 'text/css',
};

const server = http.createServer((req, res) => {
    let filePath;
    if (req.url === '/' || req.url === '/index.html') {
        filePath = path.join(__dirname, 'review-links.html');
    } else if (req.url === '/link-candidates.json') {
        filePath = path.join(ROOT, 'scripts', 'link-candidates.json');
    } else {
        res.writeHead(404);
        res.end('Not found');
        return;
    }

    const ext = path.extname(filePath);
    const mime = MIME[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(500);
            res.end('Error reading file');
            return;
        }
        res.writeHead(200, { 'Content-Type': mime });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`Review UI: http://localhost:${PORT}`);
});
