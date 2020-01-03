'use strict';
const http = require('http');

const port = process.env.NODE_PORT || 3000;
const cookieName = 't'; // t for token
const eventsListeners = [];
const users = []; // {cookie, username, lastActive}

let server = http.createServer((request, response) => {
  const url = request.url;
  const method = request.method.toUpperCase();
  console.log(`${method} ${url}`);

  // CORS support
  addCorsHeaders(request, response);
  ensureUserCookieSet(request, response);
  if (method === 'OPTIONS') {
    response.writeHead(204);
    response.end();
    return;
  }

  if (url === '/events') {
    if (method === 'GET' && request.headers.accept === 'text/event-stream') {
      registerForEvents(request, response);
      return;
    }
  } else if (url === '/messages' && method === 'POST' && request.headers['content-type'] === 'application/json') {
    request.on('data', chunk => {
      const message = JSON.parse(chunk);
      updateActiveUser(request, message.username);
      if (message.message && message.message.trim().length > 0) {
        sendEventToListeners(message);
      }
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

///////////////////////////////////////////

function addCorsHeaders(request, response) {
  // response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Origin", request.headers['origin']);
  response.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.setHeader("Access-Control-Allow-Credentials", 'true');
}

function ensureUserCookieSet(req, res) {
  const cookie = parseCookies(req.headers['cookie'])[cookieName];
  if (!cookie) {
    res.setHeader('Set-Cookie', `${cookieName}=${createToken()}; SameSite=None;`);
  }
}

function parseCookies(cookie) {
  let rx = /([^;=\s]*)=([^;]*)/g;
  let obj = {};
  for (let m; m = rx.exec(cookie);)
    obj[m[1]] = decodeURIComponent(m[2]);
  return obj;
}

function createToken() {
  return createRandomString(32);
}

function createRandomString(length) {
  const value = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randoms = [];
  for (let i = 0; i < length; i++) {
    randoms.push(value[Math.floor(Math.random() * value.length)]);
  }
  return randoms.join('');
}

function updateActiveUser(req, username) {
  const cookie = parseCookies(req.headers['cookie'])[cookieName];
  if (cookie) {
    let user = users.find(user => user.cookie === cookie);
    if (user) {
      user.lastActive = new Date();
      if (username && user.username !== username) {
        sendEventToListeners({ old: user.username, new: username }, 'username.change');
        user.username = username;
      }
    } else {
      users.push({ cookie: cookie, username: username, lastActive: new Date() });
      sendEventToListeners({ username }, 'join');
    }
  }
}

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
  response.write('\n\n');

  eventsListeners.push(response);
  response.on('close', () => {
    const index = eventsListeners.indexOf(response);
    if (index > -1) {
      eventsListeners.splice(index, 1);
    }
  });
}

function sendEventToListeners(data, eventType = null) {
  let id = new Date().toISOString();

  for (let response of eventsListeners) {
    writeEvent(response, { id, type: eventType, data });
  }
}

function writeEvent(response, event) {
  const id = event.id || new Date().toISOString();
  response.write(`id: ${id}\n`);
  if (event.type) response.write(`event: ${event.type}\n`);
  response.write(`data: ${JSON.stringify(event.data)}\n\n`);
}

// Send pings
setInterval(function () {
  sendEventToListeners({ time: new Date().toISOString() }, 'ping');
}, 30 * 1000);

// Check who left
setInterval(function () {
  for (let i = users.length - 1; i > 0; i--) {
    const user = users[i];
    // if last activity at least 1min ago
    if (new Date().getTime() - user.lastActive.getTime() > 60000) {
      sendEventToListeners({ username: user.username }, 'leave');
      users.splice(i, 1);
    }
  }
}, 5 * 1000);