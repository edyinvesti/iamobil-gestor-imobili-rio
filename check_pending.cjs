async function checkPending() {
  const url = `https://iamobil-cloud-1.onrender.com/api/partner/properties/pending`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log(`Total Pending: ${data.pending ? data.pending.length : 0}`);
    data.pending.forEach(p => console.log(`${p.id} - ${p.title} - images: ${p.images?.length}`));
  } catch (e) {
    console.error(e.message);
  }
}
checkPending();
