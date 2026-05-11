require('dotenv').config({ path: '../Deploy_IAmobil/.env' });
const { createClient } = require('@libsql/client');

async function listTursoTables() {
    const tursoUrl = process.env.TURSO_DB_URL;
    const tursoToken = process.env.TURSO_DB_AUTH_TOKEN;

    if (!tursoUrl || !tursoToken) {
        console.error("Turso credentials missing");
        return;
    }

    const tursoClient = createClient({ url: tursoUrl, authToken: tursoToken });
    try {
        const rs = await tursoClient.execute("SELECT name FROM sqlite_master WHERE type='table';");
        console.log("Tables in Turso:", rs.rows.map(r => r.name));
    } catch(e) {
        console.error(e);
    }
}
listTursoTables();
