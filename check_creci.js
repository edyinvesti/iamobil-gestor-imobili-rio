const path = require('path');
const dataEnginePath = path.resolve('c:/Users/User/Downloads/IAmobil Imobiliaria/server/data_engine.js');
const dataEngine = require(dataEnginePath);

async function check() {
  try {
    const brokers = await dataEngine.getBrokers();
    console.log("Registered Brokers:");
    console.log(JSON.stringify(brokers, null, 2));
  } catch (err) {
    console.error("Error fetching brokers:", err);
  }
  process.exit(0);
}

check();
