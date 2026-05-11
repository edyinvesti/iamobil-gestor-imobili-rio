async function testLiveApi() {
  const url = `https://iamobil-cloud-1.onrender.com/api/partner/properties?creci=987456-F`;
  const res = await fetch(url);
  console.log("Status:", res.status);
  console.log("Headers:");
  res.headers.forEach((val, key) => console.log(key, ":", val));
  const data = await res.json();
  console.log("Data sample:", Object.keys(data));
}
testLiveApi();
