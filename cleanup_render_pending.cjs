const API_BASE = "https://iamobil-cloud-1.onrender.com";

async function cleanupPendingOnRender() {
  try {
    console.log("Buscando itens pendentes no Render...");
    const res = await fetch(`${API_BASE}/api/partner/properties/pending`);
    const data = await res.json();
    
    if (!data.pending || !Array.isArray(data.pending)) {
      console.log("Nenhum item pendente encontrado ou resposta inválida.");
      return;
    }
    
    console.log(`Encontrados ${data.pending.length} itens pendentes.`);
    
    const seenTitles = new Set();
    let deletedCount = 0;
    
    for (const item of data.pending) {
      if (seenTitles.has(item.title)) {
        console.log(`Rejeitando duplicata: ${item.id} - ${item.title}`);
        const patchRes = await fetch(`${API_BASE}/api/partner/properties/pending`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item.id, action: 'reject' })
        });
        
        if (patchRes.ok) {
          deletedCount++;
        } else {
          console.error(`Falha ao rejeitar ${item.id}: ${patchRes.status}`);
        }
      } else {
        seenTitles.add(item.title);
      }
    }
    
    console.log(`Limpeza concluída. Rejeitadas ${deletedCount} duplicatas.`);
  } catch (err) {
    console.error("Erro durante a limpeza de pendentes:", err.message);
  }
  process.exit(0);
}

cleanupPendingOnRender();
