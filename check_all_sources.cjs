async function checkAllSources() {
  // Verificação 1: API de Parceiros
  console.log("=== /api/partner/properties (API de Parceiros) ===");
  try {
    const res = await fetch(`https://iamobil-cloud-1.onrender.com/api/partner/properties?creci=987456-F`);
    const data = await res.json();
    console.log(`API de Parceiros: ${data.properties?.length || 0} propriedades encontradas`);
    data.properties?.forEach(p => console.log(`  ${p.id} - ${p.title}`));
  } catch (e) { console.error("Erro na API de Parceiros:", e.message); }

  // Verificação 2: Fila de pendentes
  console.log("\n=== /api/partner/properties/pending (Fila de Pendentes) ===");
  try {
    const res = await fetch(`https://iamobil-cloud-1.onrender.com/api/partner/properties/pending`);
    const data = await res.json();
    console.log(`Fila de Pendentes: ${data.pending?.length || 0} itens`);
    const uniqueTitles = [...new Set(data.pending?.map(p => p.title))];
    console.log("Títulos únicos:", uniqueTitles);
  } catch (e) { console.error("Erro na Fila de Pendentes:", e.message); }
  
  // Verificação 3: API do Catálogo
  console.log("\n=== /api/catalog (Catálogo) ===");
  try {
    const res = await fetch(`https://iamobil-cloud-1.onrender.com/api/catalog`);
    const data = await res.json();
    console.log(`Catálogo: ${data.properties?.length || 0} propriedades encontradas`);
    data.properties?.forEach(p => console.log(`  - ${p.title}`));
  } catch (e) { console.error("Erro no Catálogo:", e.message); }
}
checkAllSources();
