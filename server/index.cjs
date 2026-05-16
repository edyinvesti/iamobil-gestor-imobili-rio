require('dotenv').config();
console.log('=== INICIANDO SERVIDOR EXPRESS ===');
const express = require('express');
const cors = require('cors');
const path = require('path');
const { HermesGateway } = require('./hermes-gateway-adapter.cjs');

let DataEngine;
try {
  const de = require('./data_engine.cjs');
  DataEngine = new de.DataEngine();
} catch (e) {
  console.log('DataEngine não disponível:', e.message);
  DataEngine = null;
}

const PORT = process.env.PORT || 10000;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const app = express();
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '../dist')));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
console.log('GEMINI_API_KEY loaded:', GEMINI_API_KEY ? 'YES' : 'NO');
const hermes = new HermesGateway();

async function sendTelegramMessage(chatId, text) {
  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text })
  });
  return response.json();
}

async function processWithAI(message) {
  const result = await hermes.processMessage(message);
  return result.response;
}

app.post('/api/telegram/webhook', async (req, res) => {
  try {
    const update = req.body;
    
    if (update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const text = update.message.text;
      
      console.log(`Mensagem recebida: ${text} de chat ${chatId}`);
      
      if (!GEMINI_API_KEY) {
        console.error('GEMINI_API_KEY não configurado!');
        await sendTelegramMessage(chatId, 'Erro: IA não configurada.');
        return res.send('OK');
      }
      
      const reply = await processWithAI(text);
      console.log('Resposta gerada:', reply.slice(0, 100));
      
      await sendTelegramMessage(chatId, reply);
      console.log('Mensagem enviada com sucesso');
    }
    
    res.send('OK');
  } catch (e) {
    console.error('Erro no webhook:', e);
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/telegram/status', (req, res) => {
  try {
    res.json({ 
      status: 'online', 
      bot_token_configured: !!TELEGRAM_BOT_TOKEN,
      gemini_configured: !!GEMINI_API_KEY 
    });
  } catch(e) {
    console.error('Erro /api/telegram/status:', e);
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/hermes/status', (req, res) => {
  try {
    res.json(hermes.getStatus());
  } catch(e) {
    console.error('Erro /api/hermes/status:', e);
    res.status(500).json({ error: e.message });
  }
});

// DataEngine endpoints
if (DataEngine) {
  app.get('/api/leads', (req, res) => {
    res.json({ success: true, leads: DataEngine.getLeads() });
  });
  
  app.get('/api/properties', (req, res) => {
    res.json({ success: true, properties: DataEngine.getProperties() });
  });
  
  app.get('/api/appointments', (req, res) => {
    res.json({ success: true, appointments: DataEngine.getAppointments() });
  });
}

app.get('/api/health', (req, res) => {
  res.json({ app: 'IAmobil Cloud', diagnostics: { gateway_internal: 'online' } });
});

// Catch-all para frontend SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});