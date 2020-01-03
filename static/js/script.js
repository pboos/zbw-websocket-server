"use strict";

import ChatClient from './ChatClient.js';

class Chat {
  constructor() {
    this.usernameInput = document.querySelector('input#username');
    this.messageInput = document.querySelector('input#message');

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

  appendMessage(html, className='chat-message') {
    const messages = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.innerHTML = html;
    messageElement.classList.add(className);
    messages.appendChild(messageElement);

    // TODO only update if user didn't scroll
    this.updateScroll();
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
    this.username = (username || this.username || '').trim();
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
    const messageForm = document.querySelector('form[name="message"]');
    messageForm.onsubmit = (e) => {
      console.log(e);
      if (this.messageInput.value && this.messageInput.value.trim().length > 0) {
        this.setUsername(this.usernameInput.value.trim()); // in case we have enter on the username
        this.chatClient.sendMessage(this.username, this.messageInput.value)
        this.messageInput.value = '';
      }
      return false;
    };
    // This would work also, but has the problem that it doesn't work on mobile.
    // this.messageInput.onkeyup = (event) => {
    //   if (event.code === 'Enter' && this.messageInput.value && this.messageInput.value.trim().length > 0) {
    //     this.chatClient.sendMessage(this.username, this.messageInput.value)
    //     this.messageInput.value = '';
    //   }
    // };
    this.messageInput.focus();
  }

  setupUsernameInput() {
    this.usernameInput.onblur = () => this.setUsername(this.usernameInput.value.trim());
  }
}

const chat = new Chat();