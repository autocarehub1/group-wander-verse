// Simple proxy to forward requests from port 3000 to port 8001
const http = require('http');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({
  target: 'http://localhost:8001',
  changeOrigin: true,
  ws: true
});

const server = http.createServer((req, res) => {
  proxy.web(req, res);
});

server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head);
});

proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  if (res.writeHead) {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Bad Gateway - Backend unavailable');
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend proxy listening on port ${PORT}, forwarding to port 8001`);
});
