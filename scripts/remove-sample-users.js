const { Client } = require('pg');

const client = new Client({
  host: process.env.PGHOST || '127.0.0.1',
  port: parseInt(process.env.PGPORT || '5432', 10),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '123456',
  database: process.env.PGDATABASE || 'library_db',
});

async function main() {
  await client.connect();
  console.log('Connected to PostgreSQL.');

  const sampleEmails = [
    'alice.thorne@readvault.internal',
    'bob.vance@readvault.internal',
    'clara.oswald@readvault.internal',
    'j.vance@readvault.internal',
    'eleanor.v@library.net',
    'j.thorne@cambridge.ac.uk',
    'clara.o@archive.org',
  ];

  const res = await client.query('DELETE FROM users WHERE email = ANY($1::text[])', [sampleEmails]);
  console.log(`Deleted ${res.rowCount} sample users from users table.`);

  const remaining = await client.query('SELECT id, name, email, access_tier FROM users ORDER BY id');
  console.log('Active authorized users in database:');
  console.table(remaining.rows);

  await client.end();
}

main().catch(console.error);
