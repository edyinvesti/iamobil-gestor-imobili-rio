async function targetedCheck() {
  const url = 'https://iamobil-edyinvesti.aws-us-west-2.turso.io/v2/pipeline';
  const token = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Nzc0OTg4NzUsImlkIjoiMDE5ZGRiMmUtNjUwMS03ZjViLWFiYTktZmM5NTkzZDAwY2NhIiwicmlkIjoiYzk2ZTRkZmEtOTExYi00YmFkLWEwYjMtYzY3Nzc3OTk1MDdkIn0.aKiA5aXmvfBKMpATrm34_c7IvkMK64XI1LHUtsMseYBej_0SzZb_VEMZSfujb72xCzerPZA3vdizhxzABLALAQ';

  const queries = [
    { type: "execute", stmt: { sql: "SELECT * FROM brokers WHERE creci = '226452'" } },
    { type: "execute", stmt: { sql: "SELECT * FROM properties WHERE brokerCreci = '226452' OR title LIKE '%CAPELINHA%'" } }
  ];

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ requests: queries })
    });
    const data = await res.json();
    console.log("Broker Found:", JSON.stringify(data.results[0].response.result.rows, null, 2));
    console.log("Properties Found:", JSON.stringify(data.results[1].response.result.rows, null, 2));
  } catch (err) {
    console.error(err.message);
  }
}
targetedCheck();
