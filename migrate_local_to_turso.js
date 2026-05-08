async function migrateProperties() {
  const properties = [
    {
      title: "Fazenda Parto",
      type: "Fazenda",
      price: 56000000,
      size: 118,
      bedrooms: 1,
      suites: 2,
      parkingSpaces: 1,
      address: "Fazenda Parto"
    },
    {
      title: "Sala Comercial",
      type: "Comercial",
      price: 587000,
      size: 580,
      bedrooms: 1,
      suites: 4,
      parkingSpaces: 0,
      address: "Centro"
    },
    {
      title: "Chacara Ceu Azul",
      type: "Chácara",
      price: 450000,
      size: 3500,
      bedrooms: 1,
      suites: 1,
      parkingSpaces: 0,
      address: "Zona Rural"
    },
    {
      title: "Terra",
      type: "Terreno",
      price: 185000,
      size: 350,
      bedrooms: 0,
      suites: 0,
      parkingSpaces: 0,
      address: "Terra"
    },
    {
      title: "Condominio Paz",
      type: "Apartamento",
      price: 850000,
      size: 500,
      bedrooms: 5,
      suites: 1,
      parkingSpaces: 4,
      address: "Rua G"
    },
    {
      title: "Casa de alto Padrao",
      type: "Casa",
      price: 2500000,
      size: 15000,
      bedrooms: 7,
      suites: 22,
      parkingSpaces: 4,
      address: "Rua 001"
    }
  ];

  console.log("Iniciando migração de 6 ativos para a nuvem...");

  for (let i = 0; i < properties.length; i++) {
    const p = properties[i];
    const payload = {
      id: `prop_migrated_${Date.now()}_${i}`,
      title: p.title,
      type: p.type,
      offerType: "Venda",
      price: p.price,
      status: "Disponível",
      address: p.address,
      size: p.size,
      sizeUnit: "m²",
      bedrooms: p.bedrooms,
      suites: p.suites,
      livingRooms: 1,
      kitchens: 1,
      bathrooms: p.suites > 0 ? p.suites + 1 : 1,
      parkingSpaces: p.parkingSpaces,
      description: "Ativo em gestão importado.",
      amenities: [],
      brokerName: "edy carlos",
      brokerCreci: "987456-F",
      images: [], // Sem imagem por enquanto, o usuário pode adicionar depois pelo App
      createdAt: Date.now()
    };

    const res = await fetch('https://iamobil-cloud-1.onrender.com/api/partner/properties', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const resData = await res.json();
    console.log(`✅ [${p.title}] Migrado. Id gerado na nuvem:`, resData.propertyId);
  }
  
  console.log("Migração concluída!");
}

migrateProperties().catch(console.error);
