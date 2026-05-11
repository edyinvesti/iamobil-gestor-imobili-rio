const path = require('path');
// Do NOT load .env from IAmobil Imobiliaria to avoid Turso connection
const dataEngine = require('c:/Users/User/Downloads/IAmobil Imobiliaria/server/data_engine.js');

async function checkLocalProperties() {
  try {
    // Manually ensure it uses local path
    dataEngine.dbPath = "c:\\Users\\User\\Downloads\\IAmobil Imobiliaria\\data\\iamobil.db";
    // Clear any existing client to force local DB
    dataEngine.dbClient = null;
    dataEngine.db = null;
    
    // We can't easily unset env vars in node process for the required module once loaded, 
    // but dataEngine.checkClient() checks this.dbClient.
    // If I set TURSO_DB_URL to empty before calling it might work.
    process.env.TURSO_DB_URL = "";
    
    const rs = await dataEngine.executeQuery("SELECT COUNT(*) as count FROM properties");
    console.log(`Local Properties Count: ${rs.rows?.[0]?.count || 0}`);
  } catch (err) {
    console.error("Error:", err);
  }
  process.exit(0);
}
checkLocalProperties();
