'use strict';
const baseUrl = '/api/v1';
// const baseUrl = 'https://zbw.pboos.ch/api/v1';
// const baseUrl = 'http://localhost:3000/api/v1';

class ChatServer {
  onConnected(listener) {
    this.onConnectedListener = listener;
  }
  onMessage(listener) {
    this.onMessageListener = listener;
  }
  onJoin(listener) {
    this.onJoinListener = listener;
  }
  onLeave(listener) {
    this.onLeaveListener = listener;
  }
  onUsernameChange(listener) {
    this.onUsernameChangeListener = listener;
  }
  start() {
    // TODO exercise listen to eventsource
    //  1. Add { withCredentials: true } as second parameter to support cookies
    this.eventSource = new EventSource(`${baseUrl}/events`, { withCredentials: true });
    this.eventSource.onopen = e => this.onConnectedListener && this.onConnectedListener();
    this.eventSource.onmessage = e => this.onMessageListener && this.onMessageListener(JSON.parse(e.data));
    this.eventSource.addEventListener('ping', e => {
      const data = JSON.parse(e.data);
      console.log(`Ping from server`);
      console.log(`- Server time: ${data.time}`);
      console.log(`- Local time:  ${new Date().toISOString()}`);
      this.sendMessage();
    });

    this.eventSource.addEventListener('join', e => this.onJoinListener && this.onJoinListener(JSON.parse(e.data)));
    this.eventSource.addEventListener('leave', e => this.onLeaveListener && this.onLeaveListener(JSON.parse(e.data)));
    this.eventSource.addEventListener('username.change', e => this.onUsernameChangeListener && this.onUsernameChangeListener(JSON.parse(e.data)));
  }

  sendMessage(username, message) {
    fetch(`${baseUrl}/messages`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ username, message }),
    });
  }
}

export default ChatServer;