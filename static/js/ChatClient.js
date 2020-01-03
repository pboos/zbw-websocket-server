'use strict';
const baseUrl = '/api/v1'; // For inclusion in the server
// const baseUrl = 'https://zbw.pboos.ch/api/v1'; // For local development with remote server
// const baseUrl = 'http://localhost:3000/api/v1'; // For local development with local server instance

class ChatClient {
  onConnected(listener) {
    this.onConnectedListener = listener;
  }
  onWelcome(listener) {
    this.onWelcomeListener = listener;
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
    // AUFGABE 9-2
    // ===========
    // In ChatClient.js in der Funktion start() von ChatClient mache folgendes:
    // 1. Erstelle eine Instanz von EventSource
    //    a. URL: `${baseUrl}/events`
    //    b. Als zweiter Parameter { withCredentials: true } damit Cookies mitgesendet
    //       werden wo-mit wir den Nutzer eindeutig identifizieren.
    //       Cookies ist nicht die Beste Art in diesem Beispiel, aber die einfachere Art.
    //       In späteren Lektionen wer-den wir anschauen wie wir dies besser lösen mit einem Header
    //       `Authorization: Bearer …`.
    // 2. Wenn connected (event open), rufe folgenden Code auf:
    //    this.onConnectedListener && this.onConnectedListener()
    // 3. Wenn eine Nachricht erhalten (event message) rufe den Listener this.onMessageListener auf.
    //    Übergebe dazu e.data als Objekt. `e.data` ist ein String welcher JSON enthält.
    //    Dieser muss also in ein Objekt umgewandelt/geparst werden.
    // Hints:
    // - Buch S. 633 – 636

    this.eventSource = new EventSource(`${baseUrl}/events`, { withCredentials: true }); // withCredentials to send Cookies and store received cookies
    this.eventSource.onopen = e => this.onConnectedListener && this.onConnectedListener();
    this.eventSource.onmessage = e => this.onMessageListener && this.onMessageListener(JSON.parse(e.data));

    this.eventSource.addEventListener('ping', e => {
      const data = JSON.parse(e.data);
      console.log(`Ping from server`);
      console.log(`- Server time: ${data.time}`);
      console.log(`- Local time:  ${new Date().toISOString()}`);
      this.sendMessage();
    });

    this.eventSource.addEventListener('welcome', e => this.onWelcomeListener && this.onWelcomeListener(JSON.parse(e.data)));
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
      credentials: 'include', // Send cookies and store cookies that are sent in the response
      body: JSON.stringify({ username, message }),
    });
  }
}

export default ChatClient;