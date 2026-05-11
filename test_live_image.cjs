async function checkLiveImage() {
  const url = `https://iamobil-cloud-1.onrender.com/properties/mansion.png`;
  console.log(`Checking live image: ${url}`);
  try {
    const res = await fetch(url);
    console.log(`Status: ${res.status} ${res.statusText}`);
    const text = await res.text();
    console.log(`Response start: ${text.substring(0, 100)}`);
  } catch (e) {
    console.error(`Error: ${e.message}`);
  }
}
checkLiveImage();
