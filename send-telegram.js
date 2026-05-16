const token = '8766470825:AAEg6tUojiHHF6KCr4TPg-DQzxSMz72lvFU';
const chatId = '6202370881';

fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ chat_id: chatId, text: 'Teste do IAmobil Gestor!' })
}).then(r => r.json()).then(console.log);