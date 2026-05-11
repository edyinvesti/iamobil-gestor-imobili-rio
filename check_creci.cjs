const path = require('path');
require('dotenv').config({ path: 'c:/Users/User/Downloads/IAmobil Imobiliaria/.env' });
const dataEnginePath = path.resolve('c:/Users/User/Downloads/IAmobil Imobiliaria/server/data_engine.js');
const dataEngine = require(dataEnginePath);

async function check() {
  try {
    const brokers = await dataEngine.getBrokers();
    console.log("Registered CRECIs:");
    brokers.forEach(b => console.log(`${b.name}: ${b.creci}`));
  } catch (err) {
    console.error("Error:", err);
  }
  process.exit(0); // Exit immediately to prevent libuv crash
}
check();
