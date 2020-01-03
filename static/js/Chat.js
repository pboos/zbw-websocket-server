"use strict";

import ChatClient from './ChatClient.js';

class Chat {
  constructor(chatMessagesElement, formElement, usernameInputElement, messageInputElement) {
    this.chatMessagesElement = chatMessagesElement;
    this.formElement = formElement;
    this.usernameInputElement = usernameInputElement;
    this.messageInputElement = messageInputElement;

    this.loadUsername();

    this.chatClient = new ChatClient();
    this.chatClient.onMessage(message => {
      this.appendMessage(`<b>${message.username}</b>: ${message.message}`);
    });
    this.chatClient.onJoin(data => {
      this.appendMessage(`<b>${data.username}</b> joined`, 'chat-join');
    });
    this.chatClient.onLeave(data => {
      this.appendMessage(`<b>${data.username}</b> left`, 'chat-leave');
    });
    this.chatClient.onUsernameChange(data => {
      this.appendMessage(`<b>${data.old}</b> is now called <b>${data.new}</b>`, 'chat-username-change');
    });
    this.chatClient.onWelcome(data => {
      this.appendMessage(`<b>Welcome!</b><br/><i>Users in chat: ${data.users.join(', ')}</i>`, 'chat-welcome');
    });
    this.chatClient.onConnected(() => this.chatClient.sendMessage(this.username, '') /* join message */);
    this.chatClient.start();

    this.updateScroll();
    this.setupMessageInput();
    this.setupUsernameInput();
  }

  appendMessage(html, className = 'chat-message') {
    const messageElement = document.createElement('div');
    messageElement.innerHTML = html;
    messageElement.classList.add(className);
    this.chatMessagesElement.appendChild(messageElement);

    // TODO only update if user didn't scroll
    this.updateScroll();
  }

  setUsername(username) {
    // AUFGABE 9-3
    // ===========
    // Wir wollen, dass der Nutzername lokal gespeichert wird. Das heisst, dass wir diesen nicht
    // jedes Mal neu setzen müssen, wenn wir die Seite erneut öffnen. Wir speichern den Nutzernamen (username) in Local Storage.
    // Dies machen wir in Chat.js.
    // 1. In der Funktion setUsername() zu unterst
    //   a. Setze in Local Storage den folgenden Eintrag
    //      key = 'username'     |     value = this.username
    // 2. In der Funktion loadUsername() am Anfang der Methode
    //   a. Lese von Local Storage den Wert für den key 'username'
    //   b. Rufe die Funktion this.setUsername() mit dem von der Local Storage geladenem username auf.
    // Hints:
    // - Buch S. 648 – 655

    this.username = (username || this.username || '').trim();
    if (this.username.length === 0) {
      // Random username: User1234
      this.username = 'User' + Math.ceil(Math.random() * 9999).toString().padStart(4, '0');
    }

    localStorage.setItem('username', this.username);
  }

  loadUsername() {
    this.setUsername(localStorage.getItem('username'));

    // use this.username, because otherwise if we enter nothing, we want the default value for username!
    this.usernameInputElement.value = this.username;
  }

  updateScroll() {
    this.chatMessagesElement.scrollTop = this.chatMessagesElement.scrollHeight;
  }

  setupMessageInput() {
    this.formElement.onsubmit = () => {
      if (this.messageInputElement.value && this.messageInputElement.value.trim().length > 0) {
        this.setUsername(this.usernameInputElement.value.trim()); // in case we have enter on the username
        this.chatClient.sendMessage(this.username, this.messageInputElement.value)
        this.messageInputElement.value = '';
      }
      return false;
    };
    // This would work also, but has the problem that it doesn't work on mobile.
    // this.messageInputElement.onkeyup = (event) => {
    //   if (event.code === 'Enter' && this.messageInputElement.value && this.messageInputElement.value.trim().length > 0) {
    //     this.chatClient.sendMessage(this.username, this.messageInputElement.value)
    //     this.messageInputElement.value = '';
    //   }
    // };
    this.messageInputElement.focus();
  }

  setupUsernameInput() {
    this.usernameInputElement.onblur = () => this.setUsername(this.usernameInputElement.value.trim());
  }
}

export default Chat;