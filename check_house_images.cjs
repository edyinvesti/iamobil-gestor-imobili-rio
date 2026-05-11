async function checkHouseImages() {
  const url = `https://iamobil-cloud-1.onrender.com/api/partner/properties?creci=987456-F`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.success && data.properties) {
      const house = data.properties.find(p => p.title.includes("Casa de alto Padrao"));
      if (house) {
        console.log(`Imagens de "${house.title}":`);
        console.log(JSON.stringify(house.images, null, 2));
      }
    }
  } catch (e) {
    console.error(e.message);
  }
}

checkHouseImages();
