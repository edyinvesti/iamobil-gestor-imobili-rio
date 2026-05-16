const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('c:/Users/User/Downloads/iamobil-gestor/data/iamobil.db');

db.serialize(() => {
  db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("Tables:", tables);
    
    tables.forEach(table => {
      db.all(`SELECT * FROM ${table.name} LIMIT 5`, (err, rows) => {
        if (err) {
          console.error(`Error reading table ${table.name}:`, err);
        } else {
          console.log(`Rows in ${table.name}:`, rows);
        }
      });
    });
  });
});

db.close();
