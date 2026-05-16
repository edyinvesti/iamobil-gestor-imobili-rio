const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join('c:', 'Users', 'User', 'Downloads', 'Deploy_IAmobil', 'data', 'iamobil.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao abrir banco:', err.message);
        return;
    }
    console.log('Conectado ao banco.');

    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
        if (err) {
            console.error(err.message);
            return;
        }
        console.log('Tabelas:', tables.map(t => t.name).join(', '));
        
        // Se houver uma tabela de configuração, listar conteúdos
        const configTable = tables.find(t => t.name.toLowerCase().includes('config') || t.name.toLowerCase().includes('setting'));
        if (configTable) {
            db.all(`SELECT * FROM ${configTable.name}`, (err, rows) => {
                if (err) console.error(err.message);
                else console.log(`Conteúdo de ${configTable.name}:`, rows);
                db.close();
            });
        } else {
            console.log('Nenhuma tabela de configuração encontrada.');
            db.close();
        }
    });
});
