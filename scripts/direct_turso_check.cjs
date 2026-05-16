async function checkTurso() {
  const url = 'https://iamobil-edyinvesti.aws-us-west-2.turso.io/v2/pipeline';
  const token = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Nzc0OTg4NzUsImlkIjoiMDE5ZGRiMmUtNjUwMS03ZjViLWFiYTktZmM5NTkzZDAwY2NhIiwicmlkIjoiYzk2ZTRkZmEtOTExYi00YmFkLWEwYjMtYzY3Nzc3OTk1MDdkIn0.aKiA5aXmvfBKMpATrm34_c7IvkMK64XI1LHUtsMseYBej_0SzZb_VEMZSfujb72xCzerPZA3vdizhxzABLALAQ';

  const queries = [
    { type: "execute", stmt: { sql: "SELECT * FROM brokers" } },
    { type: "execute", stmt: { sql: "SELECT id, title, status, brokerCreci FROM properties ORDER BY receivedAt DESC LIMIT 10" } }
  ];

  console.log("--- CONSULTANDO TURSO VIA HTTP API ---");

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ requests: queries })
    });

    if (res.ok) {
      const data = await res.json();
      const results = data.results;
      
      console.log("Resultados dos Brokers:");
      console.log(JSON.stringify(results[0].response.result.rows, null, 2));

      console.log("\nÚltimos Imóveis:");
      console.log(JSON.stringify(results[1].response.result.rows, null, 2));
    } else {
      console.error("Erro na API:", res.status, await res.text());
    }
  } catch (err) {
    console.error("Erro de conexão:", err.message);
  }
}

checkTurso();
