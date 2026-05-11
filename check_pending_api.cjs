async function checkPendingApi() {
  const url = `https://iamobil-cloud-1.onrender.com/api/partner/properties/pending`;
  
  console.log(`Buscando propriedades PENDENTES no backend: ${url}`);
  
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`Erro API: ${res.status} ${res.statusText}`);
      return;
    }
    const data = await res.json();
    
    if (data.pending) {
      console.log(`\nTotal de propriedades pendentes na nuvem: ${data.pending.length}`);
      data.pending.forEach((p, i) => {
        console.log(`${i+1}. ${p.title} (CRECI: ${p.brokerCreci || 'N/A'}) - Status: ${p.status}`);
      });
    } else {
      console.log('Nenhuma propriedade pendente encontrada ou formato de resposta inesperado.');
      console.log('Resposta:', JSON.stringify(data));
    }
  } catch (e) {
    console.error('Erro de conexão:', e.message);
  }
}

checkPendingApi();
