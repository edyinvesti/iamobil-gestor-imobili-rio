const path = require('path');
require('dotenv').config({ path: 'c:/Users/User/Downloads/IAmobil Imobiliaria/.env' });
const dataEngine = require('c:/Users/User/Downloads/IAmobil Imobiliaria/server/data_engine.js');

async function checkCloudProperties() {
  try {
    const rs = await dataEngine.executeQuery("SELECT * FROM properties");
    const props = rs.rows || [];
    console.log(`Cloud (Turso) Properties: ${props.length}`);
    props.forEach(p => console.log(`  - ${p.id} (Broker: ${p.brokerCreci})`));
  } catch (err) {
    console.error("Error:", err);
  }
  process.exit(0);
}
checkCloudProperties();
