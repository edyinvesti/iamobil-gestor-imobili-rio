const { createClient } = require('@libsql/client');

async function check() {
  const url = 'libsql://iamobil-edyinvesti.aws-us-west-2.turso.io';
  const authToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Nzc0OTg4NzUsImlkIjoiMDE5ZGRiMmUtNjUwMS03ZjViLWFiYTktZmM5NTkzZDAwY2NhIiwicmlkIjoiYzk2ZTRkZmEtOTExYi00YmFkLWEwYjMtYzY3Nzc3OTk1MDdkIn0.aKiA5aXmvfBKMpATrm34_c7IvkMK64XI1LHUtsMseYBej_0SzZb_VEMZSfujb72xCzerPZA3vdizhxzABLALAQ';

  const client = createClient({ url, authToken });

  try {
    console.log("--- TODOS OS CORRETORES ---");
    const brokersRs = await client.execute("SELECT * FROM brokers");
    console.log(brokersRs.rows);

    console.log("\n--- ÚLTIMAS 5 PROPRIEDADES ---");
    const propsRs = await client.execute("SELECT id, title, status, brokerCreci, receivedAt FROM properties ORDER BY receivedAt DESC LIMIT 5");
    console.log(propsRs.rows);

  } catch (err) {
    console.error("Erro:", err.message);
  } finally {
    client.close();
  }
}

check();
