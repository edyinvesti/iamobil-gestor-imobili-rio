async function cleanUpDuplicates() {
  const url = `https://iamobil-cloud-1.onrender.com/api/partner/properties?creci=987456-F`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!data.success) {
      console.error(`API Error: ${data.message || 'Unknown error'}`);
      return;
    }
    const props = data.properties || [];
    console.log(`Found ${props.length} total properties in cloud for CRECI 987456-F.`);

    for (let p of props) {
      if (typeof p.id === 'string' && p.id.includes('prop_migrated')) {
        console.log(`Deleting duplicate property: ${p.id} - ${p.title}`);
        await fetch(`https://iamobil-cloud-1.onrender.com/api/partner/properties?id=${p.id}`, {
          method: "DELETE"
        });
      }
    }

    // Cleanup pending queue duplicates
    console.log("\nChecking pending queue for duplicates...");
    const pendingRes = await fetch(`https://iamobil-cloud-1.onrender.com/api/partner/properties/pending`);
    const pendingData = await pendingRes.json();
    if (pendingData.success && Array.isArray(pendingData.pending)) {
      console.log(`Found ${pendingData.pending.length} pending items.`);
      // If we have many items with the same title, keep only one
      const seenTitles = new Set();
      for (let item of pendingData.pending) {
        if (seenTitles.has(item.title)) {
           console.log(`Deleting duplicate pending item: ${item.id} - ${item.title}`);
           await fetch(`https://iamobil-cloud-1.onrender.com/api/partner/properties?id=${item.id}`, {
             method: "DELETE"
           });
        } else {
           seenTitles.add(item.title);
        }
      }
    }
  } catch (e) {
    console.error(e.message);
  }
}
cleanUpDuplicates();
