async function checkApi() {
  const creci = '987456-F'; // Ed Carlos CRECI from scripts
  const url = `https://iamobil-cloud-1.onrender.com/api/partner/properties?creci=${creci}`;
  
  console.log(`Buscando propriedades no backend: ${url}`);
  
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`Erro API: ${res.status} ${res.statusText}`);
      return;
    }
    const data = await res.json();
    console.log('Dados recebidos:', JSON.stringify(data, null, 2));
    
    if (data.success && data.properties) {
      console.log(`\nTotal de propriedades na nuvem: ${data.properties.length}`);
      data.properties.forEach(p => {
        const imgCount = Array.isArray(p.images) ? p.images.length : (p.images ? 1 : 0);
        console.log(`- ${p.title}: ${imgCount} imagens`);
      });
    }
  } catch (e) {
    console.error('Erro de conexão:', e.message);
  }
}

checkApi();
