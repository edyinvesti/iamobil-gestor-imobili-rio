async function checkAllApi() {
  const url = `https://iamobil-cloud-1.onrender.com/api/partner/properties`;
  
  console.log(`Buscando ALL propriedades no backend: ${url}`);
  
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`Erro API: ${res.status} ${res.statusText}`);
      return;
    }
    const data = await res.json();
    
    if (data.success && data.properties) {
      console.log(`\nTotal de propriedades na nuvem: ${data.properties.length}`);
      data.properties.forEach((p, i) => {
        console.log(`${i+1}. ${p.title} (CRECI: ${p.brokerCreci || 'N/A'})`);
      });
    }
  } catch (e) {
    console.error('Erro de conexão:', e.message);
  }
}

checkAllApi();
