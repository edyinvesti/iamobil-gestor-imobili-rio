async function checkPendingDetails() {
  const url = `https://iamobil-cloud-1.onrender.com/api/partner/properties/pending`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.pending && data.pending.length > 0) {
      const firstSol = data.pending.find(p => p.title.includes("Condominio Sol"));
      console.log('Detalhes do primeiro Condominio Sol:');
      console.log(JSON.stringify(firstSol, null, 2));
    }
  } catch (e) {
    console.error(e.message);
  }
}

checkPendingDetails();
