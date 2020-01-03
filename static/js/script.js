"use strict";

// AUFGABE 9-1
// ===========
// 1. In Chat.js exportiere die Klasse Chat am Ende der Datei als default (Native Module)
// 2. In script.js
//    1. Importiere Chat von './Chat.js'
//    2. Ent-Kommentiere unterhalb Erstellung einer Chat-Instanz.
// 3. Hinweis:
//    In index.html ist script.js mit type="module" eingebunden.
//    Wenn dies nicht gemacht wird, funktioniert import nicht.
//    Bitte kurz ausprobieren.
// Hints:
// - Buch S.796-798
import Chat from './Chat.js';

const chat = new Chat(
  document.getElementById('chat-messages'),
  document.querySelector('form[name="message"]'),
  document.querySelector('input#username'),
  document.querySelector('input#message')
);