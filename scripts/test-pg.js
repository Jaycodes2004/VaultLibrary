const { Client } = require('pg');

const passwords = ['postgres', 'admin', 'root', '1234', '123456', 'password', 'Admin@123', 'Postgres@123', ''];

async function test() {
  for (const p of passwords) {
    const client = new Client({
      host: '127.0.0.1',
      port: 5432,
      user: 'postgres',
      password: p,
      database: 'postgres',
      connectionTimeoutMillis: 1500
    });
    try {
      await client.connect();
      console.log('SUCCESS_POSTGRES_PASSWORD=' + p);
      const res = await client.query('SELECT current_database(), current_user, version();');
      console.log('DB_INFO:', res.rows[0]);
      await client.end();
      return p;
    } catch (err) {
      console.log(`Password "${p}" failed: ${err.message}`);
    }
  }
}

test();
