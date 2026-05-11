const path = require('path');
require('dotenv').config({ path: 'c:/Users/User/Downloads/IAmobil Imobiliaria/.env' });
const dataEngine = require('c:/Users/User/Downloads/IAmobil Imobiliaria/server/data_engine.js');

async function directCleanup() {
  try {
    console.log("Starting direct cleanup on Turso...");
    
    // 1. Delete property duplicates
    const rs = await dataEngine.executeQuery("SELECT id, title FROM properties");
    const props = rs.rows || [];
    for (let p of props) {
      if (typeof p.id === 'string' && p.id.includes('prop_migrated')) {
         console.log(`Deleting property: ${p.id} - ${p.title}`);
         await dataEngine.deleteProperty(p.id);
      }
    }

    // 2. Delete pending duplicates (same title)
    const pendingRs = await dataEngine.executeQuery("SELECT id, title FROM properties WHERE status = 'pending'");
    const pending = pendingRs.rows || [];
    const seenTitles = new Set();
    for (let item of pending) {
      if (seenTitles.has(item.title)) {
         console.log(`Deleting duplicate pending: ${item.id} - ${item.title}`);
         await dataEngine.deleteProperty(item.id);
      } else {
         seenTitles.add(item.title);
      }
    }
    
    console.log("Cleanup finished.");
  } catch (err) {
    console.error("Cleanup Error:", err);
  }
  process.exit(0);
}
directCleanup();
