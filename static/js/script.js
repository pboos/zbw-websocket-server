"use strict";

import ChatClient from './ChatClient.js';

class Chat {
  constructor() {
    this.usernameInput = document.querySelector('input#username');
    this.messageInput = document.querySelector('input#message');

    this.loadUsername();

    this.chatClient = new ChatClient();
    this.chatClient.onMessage(message => {
      const messages = document.getElementById('chat-messages');
      const messageElement = document.createElement('div');
      messageElement.innerHTML = `<b>${message.username}</b>: ${message.message}`;
      messageElement.classList.add('chat-message');
      messages.appendChild(messageElement);

      // TODO only update if user didn't scroll
      this.updateScroll();
    });
    this.chatClient.onJoin(data => {
      console.log('Join', data);
    });
    this.chatClient.onLeave(data => {
      console.log('Leave', data);
    });
    this.chatClient.onUsernameChange(data => {
      console.log('Username change', data);
    });
    this.chatClient.onConnected(() => this.chatClient.sendMessage(this.username, '') /* join message */);
    this.chatClient.start();

    this.updateScroll();
    this.setupMessageInput();
    this.setupUsernameInput();
  }

  loadUsername() {
    // TODO exercise: 
    //  1. Load username from localStorage
    //  2. setUsername() with loaded username
    //  3. Update value of username input field
    this.setUsername(localStorage.getItem('username'));

    // use this.username, because otherwise if we enter nothing, we want the default value for username!
    this.usernameInput.value = this.username;
  }

  setUsername(username) {
    this.username = (username || '').trim();
    if (this.username.length === 0) {
      // Random username: User1234
      this.username = 'User' + Math.ceil(Math.random() * 9999).toString().padStart(4, '0');
    }

    // TODO exercise: Store in localStorage
    localStorage.setItem('username', this.username);
  }

  updateScroll() {
    const element = document.getElementById("chat-messages");
    element.scrollTop = element.scrollHeight;
  }

  setupMessageInput() {
    this.messageInput.onkeyup = (event) => {
      if (event.code === 'Enter' && this.messageInput.value && this.messageInput.value.trim().length > 0) {
        this.chatClient.sendMessage(this.username, this.messageInput.value)
        this.messageInput.value = '';
      }
    };
    this.messageInput.focus();
  }

  setupUsernameInput() {
    this.usernameInput.onblur = (event) => {
      this.setUsername(this.usernameInput.value.trim());
    };
  }
}

const chat = new Chat();