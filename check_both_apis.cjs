async function checkBothAPIs() {
  console.log("Checking iamobil-cloud.onrender.com");
  try {
    const res = await fetch(`https://iamobil-cloud.onrender.com/api/partner/properties/pending`);
    const data = await res.json();
    console.log(`Cloud 0 Pending: ${data.pending ? data.pending.length : 0}`);
  } catch (e) {
    console.error("Cloud 0 Failed", e.message);
  }

  console.log("\nChecking iamobil-cloud-1.onrender.com");
  try {
    const res = await fetch(`https://iamobil-cloud-1.onrender.com/api/partner/properties/pending`);
    const data = await res.json();
    console.log(`Cloud 1 Pending: ${data.pending ? data.pending.length : 0}`);
  } catch (e) {
    console.error("Cloud 1 Failed", e.message);
  }
}
checkBothAPIs();
