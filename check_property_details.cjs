async function checkPropertyDetails() {
  const url = `https://iamobil-cloud-1.onrender.com/api/partner/properties?creci=987456-F`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.success && data.properties) {
      console.log('--- DETALHES DOS IMÓVEIS ---');
      data.properties.forEach(p => {
        console.log(`\n🏠 ${p.title}`);
        console.log(`Preço: ${p.price}`);
        console.log(`Imagens: ${JSON.stringify(p.images)}`);
        console.log(`Descrição: ${p.description}`);
        if(p.imagePath) console.log(`imagePath: ${p.imagePath}`);
      });
    }
  } catch (e) {
    console.error(e.message);
  }
}

checkPropertyDetails();
