const { createClient } = require('@libsql/client');
const path = require('path');

const dbPath = process.env.DATABASE_URL || 'file:' + path.join(__dirname, '../data/iamobil.db');

let client;

try {
  client = createClient({ 
    url: dbPath,
    authToken: process.env.LIBSQL_AUTH_TOKEN || ''
  });
  initializeTables();
} catch (e) {
  console.log('Banco local não disponível, usando modo apenas memória:', e.message);
  client = null;
}

async function initializeTables() {
  if (!client) return;
  
  try {
    await client.batch([
      `CREATE TABLE IF NOT EXISTS leads (
        id TEXT PRIMARY KEY,
        name TEXT,
        phone TEXT,
        email TEXT,
        source TEXT,
        status TEXT DEFAULT 'novo',
        score INTEGER DEFAULT 0,
        notes TEXT,
        contact TEXT,
        interest TEXT,
        potential_value REAL,
        created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
      )`,
      `CREATE TABLE IF NOT EXISTS properties (
        id TEXT PRIMARY KEY,
        title TEXT,
        type TEXT,
        offer_type TEXT,
        price REAL,
        address TEXT,
        city TEXT,
        neighborhood TEXT,
        bedrooms INTEGER DEFAULT 0,
        bathrooms INTEGER DEFAULT 0,
        parking_spaces INTEGER DEFAULT 0,
        size REAL,
        size_unit TEXT,
        status TEXT DEFAULT 'disponivel',
        images TEXT,
        latitude REAL,
        longitude REAL,
        created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
      )`,
      `CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY,
        lead_id TEXT,
        property_id TEXT,
        lead_name TEXT,
        property_title TEXT,
        date TEXT,
        time TEXT,
        note TEXT,
        status TEXT DEFAULT 'agendado',
        created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
      )`,
      `CREATE TABLE IF NOT EXISTS telegram_users (
        chat_id INTEGER PRIMARY KEY,
        username TEXT,
        creci TEXT,
        lang TEXT DEFAULT 'pt',
        created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
      )`
    ], "write");
  } catch (e) {
    console.error('Erro ao inicializar tabelas:', e.message);
  }
}

class DataEngine {
  async addLead(lead) {
    if (!client) return null;
    try {
      return await client.execute({
        sql: `INSERT INTO leads (id, name, phone, email, source, status, score, notes, contact, interest, potential_value) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [lead.id, lead.name, lead.phone, lead.email, lead.source, lead.status || 'novo', 
               lead.score || 0, lead.notes || '', lead.contact || '', lead.interest || '', lead.potential_value || 0]
      });
    } catch (e) {
      console.error('addLead error:', e.message);
      return null;
    }
  }

  async getLeads() {
    if (!client) return [];
    try {
      const rs = await client.execute('SELECT * FROM leads ORDER BY created_at DESC');
      return rs.rows;
    } catch (e) {
      console.error('getLeads error:', e.message);
      return [];
    }
  }

  async addProperty(property) {
    if (!client) return null;
    try {
      return await client.execute({
        sql: `INSERT INTO properties (id, title, type, offer_type, price, address, city, neighborhood, 
              bedrooms, bathrooms, parking_spaces, size, size_unit, status, images, latitude, longitude) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [property.id, property.title, property.type, property.offerType, property.price, 
               property.address, property.city, property.neighborhood, property.bedrooms || 0, 
               property.bathrooms || 0, property.parkingSpaces || 0, property.size, property.sizeUnit,
               property.status || 'disponivel', JSON.stringify(property.images || []), 
               property.latitude, property.longitude]
      });
    } catch (e) {
      console.error('addProperty error:', e.message);
      return null;
    }
  }

  async getProperties() {
    if (!client) return [];
    try {
      const rs = await client.execute('SELECT * FROM properties ORDER BY created_at DESC');
      return rs.rows.map(row => ({
        ...row,
        images: row.images ? JSON.parse(row.images) : [],
        offerType: row.offer_type,
        parkingSpaces: row.parking_spaces,
        sizeUnit: row.size_unit
      }));
    } catch (e) {
      console.error('getProperties error:', e.message);
      return [];
    }
  }

  async addAppointment(appointment) {
    if (!client) return null;
    try {
      return await client.execute({
        sql: `INSERT INTO appointments (id, lead_id, property_id, lead_name, property_title, date, time, note, status) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [appointment.id, appointment.leadId, appointment.propertyId, appointment.leadName,
               appointment.propertyTitle, appointment.date, appointment.time, appointment.note || '', 
               appointment.status || 'agendado']
      });
    } catch (e) {
      console.error('addAppointment error:', e.message);
      return null;
    }
  }

  async getAppointments() {
    if (!client) return [];
    try {
      const rs = await client.execute('SELECT * FROM appointments ORDER BY date ASC');
      return rs.rows;
    } catch (e) {
      console.error('getAppointments error:', e.message);
      return [];
    }
  }

  async saveTelegramUser(chatId, username, creci = null) {
    if (!client) return null;
    try {
      return await client.execute({
        sql: `INSERT OR REPLACE INTO telegram_users (chat_id, username, creci) VALUES (?, ?, ?)`,
        args: [chatId, username, creci]
      });
    } catch (e) {
      console.error('saveTelegramUser error:', e.message);
      return null;
    }
  }

  async getTelegramUser(chatId) {
    if (!client) return null;
    try {
      const rs = await client.execute({
        sql: 'SELECT * FROM telegram_users WHERE chat_id = ?',
        args: [chatId]
      });
      return rs.rows[0] || null;
    } catch (e) {
      console.error('getTelegramUser error:', e.message);
      return null;
    }
  }

  async linkUserToTelegram(creci, chatId) {
    if (!client) return null;
    try {
      await client.execute({
        sql: 'UPDATE telegram_users SET creci = ? WHERE chat_id = ?',
        args: [creci, chatId]
      });
      return { success: true };
    } catch (e) {
      console.error('linkUserToTelegram error:', e.message);
      return null;
    }
  }
}

module.exports = { DataEngine };