const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DATABASE_URL || path.join(__dirname, '../data/iamobil.db');

let db;

try {
  db = new Database(dbPath);
  initializeTables();
} catch (e) {
  console.log('Banco local não disponível, usando modo apenas memória');
  db = null;
}

function initializeTables() {
  if (!db) return;
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      name TEXT,
      phone TEXT,
      email TEXT,
      source TEXT,
      status TEXT DEFAULT 'new',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS properties (
      id TEXT PRIMARY KEY,
      title TEXT,
      price REAL,
      address TEXT,
      status TEXT DEFAULT 'available',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      lead_id TEXT,
      property_id TEXT,
      date DATETIME,
      status TEXT DEFAULT 'scheduled',
      notes TEXT,
      FOREIGN KEY(lead_id) REFERENCES leads(id),
      FOREIGN KEY(property_id) REFERENCES properties(id)
    );
  `);
}

class DataEngine {
  addLead(lead) {
    if (!db) return null;
    const stmt = db.prepare('INSERT INTO leads (id, name, phone, email, source, status) VALUES (?, ?, ?, ?, ?, ?)');
    return stmt.run(lead.id, lead.name, lead.phone, lead.email, lead.source, lead.status || 'new');
  }

  getLeads() {
    if (!db) return [];
    return db.prepare('SELECT * FROM leads ORDER BY created_at DESC').all();
  }

  addProperty(property) {
    if (!db) return null;
    const stmt = db.prepare('INSERT INTO properties (id, title, price, address, status) VALUES (?, ?, ?, ?, ?)');
    return stmt.run(property.id, property.title, property.price, property.address, property.status || 'available');
  }

  getProperties() {
    if (!db) return [];
    return db.prepare('SELECT * FROM properties ORDER BY created_at DESC').all();
  }

  addAppointment(appointment) {
    if (!db) return null;
    const stmt = db.prepare('INSERT INTO appointments (id, lead_id, property_id, date, status, notes) VALUES (?, ?, ?, ?, ?, ?)');
    return stmt.run(appointment.id, appointment.leadId, appointment.propertyId, appointment.date, appointment.status || 'scheduled', appointment.notes);
  }

  getAppointments() {
    if (!db) return [];
    return db.prepare('SELECT * FROM appointments ORDER BY date ASC').all();
  }
}

module.exports = { DataEngine };