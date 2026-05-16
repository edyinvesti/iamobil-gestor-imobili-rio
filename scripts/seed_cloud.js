async function seedCloud() {
  // 1. Registrar o Gestor para garantir que existe
  console.log("Registrando gestor...");
  await fetch('https://iamobil-cloud-1.onrender.com/api/partner/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'edy carlos',
      creci: '987456-F',
      phone: '(11) 99999-9999',
      email: 'edy@example.com'
    })
  });

  // 2. Colocar um imóvel de teste
  console.log("Enviando imóvel de teste com imagens reais...");
  const property = {
    id: `prop_seed_${Date.now()}`,
    title: "Cobertura Triplex Royal",
    type: "Apartamento",
    offerType: "Venda",
    price: 9500000,
    status: "Disponível",
    address: "Setor Bueno, Goiânia - GO",
    size: 450,
    sizeUnit: "m²",
    bedrooms: 5,
    suites: 5,
    livingRooms: 4,
    kitchens: 2,
    bathrooms: 8,
    parkingSpaces: 6,
    description: "Excelente cobertura com vista panoramica para o Vaca Brava.\nPiscina Privativa, Heliponto, Elevador Exclusivo",
    amenities: ["Piscina Privativa", "Heliponto", "Elevador Exclusivo"],
    brokerName: "edy carlos",
    brokerCreci: "987456-F",
    // Usando uma imagem de exemplo na internet para mostrar funcionando:
    images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80"],
    createdAt: Date.now()
  };

  const res = await fetch('https://iamobil-cloud-1.onrender.com/api/partner/properties', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(property)
  });

  const resData = await res.json();
  console.log("Resultado:", resData);
}

seedCloud().catch(console.error);
