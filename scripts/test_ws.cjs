const WebSocket = require('ws');
const url = 'ws://127.0.0.1:18789';

console.log(`🔍 Testando conexão com ${url}...`);

const ws = new WebSocket(url);

ws.on('open', () => {
    console.log('✅ Conectado com sucesso ao Hermes WebSocket!');
    ws.close();
    process.exit(0);
});

ws.on('error', (err) => {
    console.error('❌ Erro na conexão:', err.message);
    process.exit(1);
});

setTimeout(() => {
    console.log('🕒 Timeout na conexão.');
    process.exit(1);
}, 5000);
