const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = 'c:/Users/User/Downloads/iamobil-gestor/data/iamobil.db';
const db = new sqlite3.Database(dbPath);

console.log('--- Inspecionando Banco de Dados IAmobil Gestor ---');

db.all("SELECT id, title, images, imagePath FROM properties LIMIT 10", (err, rows) => {
  if (err) {
    console.error('Erro ao consultar banco:', err.message);
    process.exit(1);
  }

  console.log(`Encontradas ${rows.length} propriedades.`);
  rows.forEach(r => {
    console.log(`\nID: ${r.id}`);
    console.log(`Título: ${r.title}`);
    console.log(`Imagens (JSON): ${r.images}`);
    console.log(`imagePath: ${r.imagePath}`);
  });
  
  db.close();
});
