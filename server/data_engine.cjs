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
        status TEXT DEFAULT 'new',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS properties (
        id TEXT PRIMARY KEY,
        title TEXT,
        price REAL,
        address TEXT,
        status TEXT DEFAULT 'available',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY,
        lead_id TEXT,
        property_id TEXT,
        date DATETIME,
        status TEXT DEFAULT 'scheduled',
        notes TEXT,
        FOREIGN KEY(lead_id) REFERENCES leads(id),
        FOREIGN KEY(property_id) REFERENCES properties(id)
      )`
    ], "write");
  } catch (e) {
    console.error('Erro ao inicializar tabelas:', e.message);
  }
}

class DataEngine {
  async addLead(lead) {
    if (!client) return null;
    return await client.execute({
      sql: 'INSERT INTO leads (id, name, phone, email, source, status) VALUES (?, ?, ?, ?, ?, ?)',
      args: [lead.id, lead.name, lead.phone, lead.email, lead.source, lead.status || 'new']
    });
  }

  async getLeads() {
    if (!client) return [];
    const rs = await client.execute('SELECT * FROM leads ORDER BY created_at DESC');
    return rs.rows;
  }

  async addProperty(property) {
    if (!client) return null;
    return await client.execute({
      sql: 'INSERT INTO properties (id, title, price, address, status) VALUES (?, ?, ?, ?, ?)',
      args: [property.id, property.title, property.price, property.address, property.status || 'available']
    });
  }

  async getProperties() {
    if (!client) return [];
    const rs = await client.execute('SELECT * FROM properties ORDER BY created_at DESC');
    return rs.rows;
  }

  async addAppointment(appointment) {
    if (!client) return null;
    return await client.execute({
      sql: 'INSERT INTO appointments (id, lead_id, property_id, date, status, notes) VALUES (?, ?, ?, ?, ?, ?)',
      args: [appointment.id, appointment.leadId, appointment.propertyId, appointment.date, appointment.status || 'scheduled', appointment.notes]
    });
  }

  async getAppointments() {
    if (!client) return [];
    const rs = await client.execute('SELECT * FROM appointments ORDER BY date ASC');
    return rs.rows;
  }
}

module.exports = { DataEngine };