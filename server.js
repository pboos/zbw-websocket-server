'use strict';
const http = require('http');

const port = process.env.NODE_PORT || 3000;
const eventsListeners = [];

let server = http.createServer((request, response) => {
  const url = request.url;
  const method = request.method.toUpperCase();
  console.log(`${method} ${url}`);

  if (url === '/events') {
    if (method === 'GET' && request.headers.accept === 'text/event-stream') {
      registerForEvents(request, response);
      return;
    }
  } else if (url === '/messages' && method === 'POST' && request.headers['content-type'] === 'application/json') {
    request.on('data', chunk => {
      sendEventToListeners(JSON.parse(chunk));
      response.writeHead(201);
      response.end();
    });
    return;
  }

  // response.writeHead(200, {'Content-Type': 'text/html'});
  // response.write(fs.readFileSync(__dirname + '/index.html'));

  response.writeHead(404);
  response.end();
});
server.listen(port, () => {
  console.log(`Server started: http://localhost:${port}`);
});

function getRemoteIpAddress(req) {
  // req.headers['x-forwaded-for']
  // req.connection.remoteAddress
}

function registerForEvents(request, response) {
  response.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  eventsListeners.push(response);
  response.on('close', () => {
    const index = eventsListeners.indexOf(response);
    if (index > -1) {
      eventsListeners.splice(index, 1);
    }
  });
}

function sendEventToListeners(data, type = null) {
  let id = new Date().toISOString();

  for (let response of eventsListeners) {
    response.write(`id: ${id}\n`);
    if (type) response.write(`type: ${type}\n`);
    response.write(`data: ${JSON.stringify(data)}\n\n`);
  }
}

setInterval(function () {
  sendEventToListeners({time: new Date().toISOString()}, 'ping');
}, 30 * 1000);
