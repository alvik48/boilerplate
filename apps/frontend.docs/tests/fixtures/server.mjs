import { createServer } from 'node:http';
const server = createServer(async (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', 'http://localhost:3002');
  response.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (request.method === 'OPTIONS') {
    response.writeHead(204).end();
    return;
  }
  if (request.url === '/ready') {
    response.end('ready');
    return;
  }
  if (request.headers.authorization !== 'Bearer test-only-token') {
    response.writeHead(401).end('Missing test token');
    return;
  }
  let body = '';
  for await (const chunk of request) body += chunk;
  response.setHeader('Content-Type', 'application/json');
  response.end(body);
});
server.listen(3999, '127.0.0.1');
process.on('SIGTERM', () => server.close());
