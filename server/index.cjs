require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const winston = require('winston');
const bcrypt = require('bcryptjs');
const { HermesGateway } = require('./hermes-gateway-adapter.cjs');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
          return `${timestamp} [${level}]: ${message} ${metaStr}`;
        })
      )
    })
  ]
});

let DataEngine;
let dataEngineInstance;

try {
  const de = require('./data_engine.cjs');
  dataEngineInstance = new de.DataEngine();
  DataEngine = dataEngineInstance;
  logger.info('DataEngine initialized');
} catch (e) {
  logger.warn('DataEngine not available', { error: e.message });
  DataEngine = null;
}

const PORT = process.env.PORT || 10000;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',');
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: { error: 'Muitas requisições. Tente novamente mais tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn('Rate limit exceeded', { ip: req.ip, path: req.path });
    res.status(options.statusCode).json(options.message);
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
  handler: (req, res, next, options) => {
    logger.warn('Auth rate limit exceeded', { ip: req.ip });
    res.status(options.statusCode).json(options.message);
  }
});

app.use('/api/', apiLimiter);

app.use(express.static(path.join(__dirname, '../dist')));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
logger.info('Server starting', { 
  port: PORT, 
  geminiConfigured: !!GEMINI_API_KEY,
  corsOrigins: allowedOrigins 
});

const hermes = new HermesGateway();

const users = new Map();

function sanitizeInput(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/<[^>]*>/g, '').trim().slice(0, 1000);
}

function validatePropertyData(data) {
  const errors = [];
  
  if (!data.title || typeof data.title !== 'string' || data.title.length < 3) {
    errors.push('Título inválido');
  }
  if (data.price !== undefined && (typeof data.price !== 'number' || data.price < 0)) {
    errors.push('Preço inválido');
  }
  if (data.images && Array.isArray(data.images)) {
    const totalSize = data.images.reduce((acc, img) => acc + (img?.length || 0), 0);
    if (totalSize > 5 * 1024 * 1024) {
      errors.push('Tamanho total das imagens excede 5MB');
    }
    if (data.images.length > 10) {
      errors.push('Máximo de 10 imagens por imóvel');
    }
  }
  
  return errors;
}

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

app.post('/api/auth/register',
  authLimiter,
  body('creci').isLength({ min: 3, max: 20 }).trim(),
  body('password').isLength({ min: 6, max: 100 }),
  body('name').isLength({ min: 2, max: 100 }).trim(),
  body('email').isEmail().normalizeEmail(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.warn('Validation failed', { errors: errors.array() });
        return res.status(400).json({ error: 'Dados inválidos', details: errors.array() });
      }

      const { creci, password, name, email, phone } = req.body;
      const safeCreci = sanitizeInput(creci);

      if (users.has(safeCreci)) {
        logger.warn('Registration failed - CRECI exists', { creci: safeCreci });
        return res.status(409).json({ error: 'CRECI já cadastrado' });
      }

      const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
      
      const user = {
        creci: safeCreci,
        password: hashedPassword,
        name: sanitizeInput(name),
        email: sanitizeInput(email),
        phone: sanitizeInput(phone || ''),
        createdAt: Date.now()
      };

      users.set(safeCreci, user);
      
      logger.info('User registered', { creci: safeCreci });
      res.status(201).json({ success: true, creci: safeCreci });
    } catch (e) {
      logger.error('Registration error', { error: e.message });
      res.status(500).json({ error: 'Erro interno' });
    }
  }
);

app.post('/api/auth/login',
  authLimiter,
  body('creci').notEmpty().trim(),
  body('password').notEmpty(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'CRECI e senha são obrigatórios' });
      }

      const { creci, password } = req.body;
      const safeCreci = sanitizeInput(creci);
      const user = users.get(safeCreci);

      if (!user) {
        logger.warn('Login failed - user not found', { creci: safeCreci });
        return res.status(401).json({ error: 'CRECI ou senha incorretos' });
      }

      const isValid = await bcrypt.compare(password, user.password);
      
      if (!isValid) {
        logger.warn('Login failed - wrong password', { creci: safeCreci });
        return res.status(401).json({ error: 'CRECI ou senha incorretos' });
      }

      const token = Buffer.from(`${safeCreci}:${Date.now()}`).toString('base64');
      
      logger.info('Login successful', { creci: safeCreci });
      res.json({ 
        success: true, 
        token,
        user: { creci: safeCreci, name: user.name, email: user.email, phone: user.phone }
      });
    } catch (e) {
      logger.error('Login error', { error: e.message });
      res.status(500).json({ error: 'Erro interno' });
    }
  }
);

app.post('/api/telegram/webhook', async (req, res) => {
  try {
    const update = req.body;
    
    if (update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const text = sanitizeInput(update.message.text);
      
      logger.info('Telegram message received', { chatId, text: text.slice(0, 50) });
      
      if (!GEMINI_API_KEY) {
        logger.error('GEMINI_API_KEY not configured');
        await sendTelegramMessage(chatId, 'Erro: IA não configurada.');
        return res.send('OK');
      }
      
      const reply = await processWithAI(text);
      logger.info('AI response generated', { chatId, replyLength: reply.length });
      
      await sendTelegramMessage(chatId, reply);
      logger.info('Telegram reply sent', { chatId });
    }
    
    res.send('OK');
  } catch (e) {
    logger.error('Webhook error', { error: e.message, stack: e.stack });
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/telegram/status', (req, res) => {
  res.json({ 
    status: 'online', 
    bot_token_configured: !!TELEGRAM_BOT_TOKEN,
    gemini_configured: !!GEMINI_API_KEY 
  });
});

app.get('/api/hermes/status', (req, res) => {
  try {
    const status = hermes.getStatus();
    res.json({ ...status, timestamp: new Date().toISOString() });
  } catch(e) {
    logger.error('Hermes status error', { error: e.message });
    res.status(500).json({ error: 'Erro ao obter status' });
  }
});

if (DataEngine) {
  app.get('/api/leads', async (req, res) => {
    try {
      const leads = await DataEngine.getLeads();
      res.json({ success: true, count: leads.length, leads });
    } catch (e) {
      logger.error('Leads fetch error', { error: e.message });
      res.status(500).json({ error: 'Erro ao buscar leads' });
    }
  });
  
  app.get('/api/properties', async (req, res) => {
    try {
      const properties = await DataEngine.getProperties();
      res.json({ success: true, count: properties.length, properties });
    } catch (e) {
      logger.error('Properties fetch error', { error: e.message });
      res.status(500).json({ error: 'Erro ao buscar imóveis' });
    }
  });
  
  app.get('/api/appointments', async (req, res) => {
    try {
      const appointments = await DataEngine.getAppointments();
      res.json({ success: true, count: appointments.length, appointments });
    } catch (e) {
      logger.error('Appointments fetch error', { error: e.message });
      res.status(500).json({ error: 'Erro ao buscar agendamentos' });
    }
  });
}

app.get('/api/health', (req, res) => {
  res.json({ 
    app: 'IAmobil Gestor',
    version: '1.0.0',
    status: 'online',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.use((err, req, res, next) => {
  logger.error('Unhandled error', { 
    error: err.message, 
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  res.status(500).json({ error: 'Erro interno do servidor' });
});

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 Servidor rodando na porta ${PORT}`);
});