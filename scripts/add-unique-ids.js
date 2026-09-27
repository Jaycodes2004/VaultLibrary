const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5432,
  user: 'postgres',
  password: '123456',
  database: 'library_db'
});

async function run() {
  await client.connect();
  console.log('Connected to PostgreSQL library_db');
  
  // 1. Add unique_id column if not exists
  await client.query('ALTER TABLE books ADD COLUMN IF NOT EXISTS unique_id VARCHAR(50);');
  console.log('Column unique_id ensured on table books.');

  // 2. Fetch all books
  const res = await client.query('SELECT id, file_name FROM books ORDER BY id ASC');
  console.log(`Assigning formatted Unique IDs to ${res.rows.length} books...`);

  for (let i = 0; i < res.rows.length; i++) {
    const row = res.rows[i];
    // Numeric part or sequential index
    const match = row.id.match(/\d+/);
    const num = match ? parseInt(match[0], 10) : i + 1;
    const padded = String(num).padStart(4, '0');
    const uniqueId = `RV-BK-${padded}`;

    await client.query('UPDATE books SET unique_id = $1 WHERE id = $2', [uniqueId, row.id]);
  }

  // 3. Ensure unique index
  await client.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_books_unique_id ON books(unique_id);');
  console.log('Unique index on books(unique_id) verified.');

  // 4. Sample check
  const sample = await client.query('SELECT id, unique_id, title FROM books ORDER BY id ASC LIMIT 5');
  console.log('Sample books with unique_id:');
  console.table(sample.rows);

  await client.end();
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
