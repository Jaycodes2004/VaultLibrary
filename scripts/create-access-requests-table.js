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

  await client.query(`
    CREATE TABLE IF NOT EXISTS library_access_requests (
      id VARCHAR(120) PRIMARY KEY,
      full_name VARCHAR(150) NOT NULL,
      email VARCHAR(150) NOT NULL,
      organization VARCHAR(200),
      purpose TEXT,
      desired_tier VARCHAR(50) DEFAULT 'scholar',
      status VARCHAR(50) DEFAULT 'pending',
      admin_email VARCHAR(150) DEFAULT 'admin@vaultlibrary.org',
      notification_dispatched BOOLEAN DEFAULT true,
      admin_notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      reviewed_at TIMESTAMP
    );
  `);
  console.log('Table library_access_requests verified.');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@vaultlibrary.org';

  // Check if initial sample requests exist
  const res = await client.query('SELECT COUNT(*) FROM library_access_requests');
  if (parseInt(res.rows[0].count, 10) === 0) {
    console.log('Seeding initial pending library access requests...');
    await client.query(`
      INSERT INTO library_access_requests (
        id, full_name, email, organization, purpose, desired_tier, status, admin_email, notification_dispatched
      ) VALUES 
      ('req-acc-001', 'Elena Rostova', 'elena.rostova@oxford-research.org', 'Department of Computer Science, Oxford', 'Doctoral research on distributed consensus algorithms and operating system primitives.', 'scholar', 'pending', $1, true),
      ('req-acc-002', 'Marcus Aurel', 'm.aurel@mit-labs.edu', 'MIT Computer Science & AI Lab', 'Curriculum study on systems architecture and machine learning reference volumes.', 'scholar', 'pending', $1, true);
    `, [adminEmail]);
    console.log(`Seeded sample access requests with admin email: ${adminEmail}`);
  }

  const sample = await client.query('SELECT id, full_name, email, status, admin_email FROM library_access_requests');
  console.table(sample.rows);

  await client.end();
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
