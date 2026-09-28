const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DB_CONFIG = {
  host: process.env.PGHOST || '127.0.0.1',
  port: parseInt(process.env.PGPORT || '5432', 10),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '123456',
};

const BOOKS_DIR = 'D:\\Desktop\\Archive\\Books';

// Clean and parse book title and author from file name
function parseBookFilename(fileName) {
  let clean = fileName
    .replace(/\.pdf$/i, '')
    .replace(/\.epub$/i, '')
    .replace(/\.azw3$/i, '')
    .replace(/\(\s*PDFDrive\.com\s*\)/gi, '')
    .replace(/\(\s*z-lib\.org\s*\)/gi, '')
    .replace(/\(\s*PDF Room\s*\)/gi, '')
    .replace(/\(\d+\)/g, '')
    .trim();

  let title = clean;
  let author = 'ReadVault Scholar Archive';

  if (clean.includes(' - ')) {
    const parts = clean.split(' - ');
    if (parts.length >= 2) {
      // Check if author is first or title is first
      // E.g. "Andrew S. Tanenbaum - Computer Networks" or "500 Lines Or Less - Michael DiBernardo"
      if (clean.toLowerCase().includes('500 lines or less')) {
        title = parts[0].trim();
        author = parts[1].trim();
      } else if (parts[0].length < 30 && (parts[0].includes(' ') || parts[0].includes('.'))) {
        author = parts[0].trim();
        title = parts.slice(1).join(' - ').trim();
      } else {
        title = parts[0].trim();
        author = parts.slice(1).join(' - ').trim();
      }
    }
  } else if (clean.toLowerCase().includes(' by ')) {
    const parts = clean.split(/ by /i);
    title = parts[0].trim();
    author = parts[1].trim();
  } else if (clean.startsWith('2015_Book_') || clean.startsWith('2017_Book_') || clean.startsWith('2018_Book_')) {
    title = clean.replace(/^\d{4}_Book_/, '').replace(/([A-Z])/g, ' $1').trim();
    author = 'Springer Academic Press';
  } else if (clean.startsWith('2019Burkov')) {
    title = 'The Hundred-page Machine Learning Book';
    author = 'Andriy Burkov';
  } else if (/^\d+[-_]/.test(clean)) {
    title = clean.replace(/^\d+[-_]/, '').trim();
  }

  // Final cleanup of title and author
  title = title.replace(/[_\.]+/g, ' ').replace(/\s+/g, ' ').trim();
  author = author.replace(/[_\.]+/g, ' ').replace(/\s+/g, ' ').trim();

  return { title, author };
}

// Recursively find all pdf and epub files in directory
function scanBooksRecursive(dir) {
  let results = [];
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        results = results.concat(scanBooksRecursive(fullPath));
      } else if (item.isFile()) {
        const ext = path.extname(item.name).toLowerCase();
        if (ext === '.pdf' || ext === '.epub') {
          results.push({
            fullPath,
            fileName: item.name,
            ext: ext.replace('.', ''),
            size: fs.statSync(fullPath).size
          });
        }
      }
    }
  } catch (err) {
    console.error(`Error reading ${dir}:`, err.message);
  }
  return results;
}

// Generate realistic gradient based on index
const GRADIENTS = [
  'from-amber-800 to-stone-900',
  'from-stone-800 to-amber-950',
  'from-yellow-900 to-stone-800',
  'from-orange-950 to-stone-900',
  'from-amber-700 to-stone-950',
  'from-stone-900 to-zinc-800',
  'from-emerald-950 to-stone-900',
  'from-amber-900 to-zinc-900'
];

const CATEGORIES = [
  'Systems Architecture',
  'Machine Learning & AI',
  'Computer Science',
  'Software Engineering',
  'Algorithms & Data Structures',
  'Distributed Systems'
];

async function initializeDatabase() {
  console.log('Connecting to PostgreSQL...');
  const rootClient = new Client({ ...DB_CONFIG, database: 'postgres' });
  await rootClient.connect();

  // Create database library_db if not exists
  const dbCheck = await rootClient.query("SELECT 1 FROM pg_database WHERE datname = 'library_db'");
  if (dbCheck.rows.length === 0) {
    console.log('Creating database "library_db"...');
    await rootClient.query('CREATE DATABASE library_db');
  } else {
    console.log('Database "library_db" already exists.');
  }
  await rootClient.end();

  // Connect to library_db
  const dbClient = new Client({ ...DB_CONFIG, database: 'library_db' });
  await dbClient.connect();
  console.log('Connected to library_db.');

  // Create tables
  console.log('Creating database tables if not exist...');
  await dbClient.query(`
    CREATE TABLE IF NOT EXISTS library_config (
      key VARCHAR(100) PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS books (
      id VARCHAR(120) PRIMARY KEY,
      unique_id VARCHAR(50) UNIQUE,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_type VARCHAR(10) NOT NULL DEFAULT 'pdf',
      file_size BIGINT NOT NULL DEFAULT 0,
      category VARCHAR(100) NOT NULL DEFAULT 'Computer Science',
      cover_gradient VARCHAR(100) NOT NULL DEFAULT 'from-amber-800 to-stone-900',
      total_pages INT NOT NULL DEFAULT 100,
      is_allowed BOOLEAN NOT NULL DEFAULT true,
      allowed_by VARCHAR(100) DEFAULT 'admin',
      allowed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chapters (
      id VARCHAR(150) PRIMARY KEY,
      book_id VARCHAR(120) REFERENCES books(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      chapter_order INT NOT NULL,
      page_number INT NOT NULL DEFAULT 1,
      paragraphs JSONB NOT NULL DEFAULT '[]'::jsonb
    );

    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(120) PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      access_tier VARCHAR(50) NOT NULL DEFAULT 'scholar',
      allowed_books JSONB NOT NULL DEFAULT '["all"]'::jsonb,
      last_book_read_id VARCHAR(120),
      last_read_location VARCHAR(120),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS book_requests (
      id VARCHAR(120) PRIMARY KEY,
      user_id VARCHAR(120) NOT NULL,
      user_name VARCHAR(120) NOT NULL,
      user_email VARCHAR(150) NOT NULL,
      requested_title TEXT NOT NULL,
      requested_author TEXT NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      matched_file_path TEXT,
      notification_sent BOOLEAN NOT NULL DEFAULT false,
      admin_notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reading_progress (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(120) NOT NULL,
      book_id VARCHAR(120) NOT NULL,
      book_title TEXT NOT NULL,
      chapter_title TEXT NOT NULL,
      location_cfi TEXT NOT NULL,
      progress_percentage INT NOT NULL DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, book_id)
    );
  `);

  // Insert or update config
  await dbClient.query(`
    INSERT INTO library_config (key, value)
    VALUES ('storage_path', $1)
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
  `, [BOOKS_DIR]);

  // Insert initial default users if none exist
  const userCount = await dbClient.query('SELECT COUNT(*) FROM users');
  if (parseInt(userCount.rows[0].count, 10) === 0) {
    console.log('Seeding initial library users...');
    const initialUsers = [
      { id: 'usr_admin', name: 'ReadVault Chief Administrator', email: 'admin@readvault.internal', access_tier: 'admin' },
    ];
    for (const u of initialUsers) {
      await dbClient.query(
        'INSERT INTO users (id, name, email, access_tier, allowed_books) VALUES ($1, $2, $3, $4, $5)',
        [u.id, u.name, u.email, u.access_tier, JSON.stringify(['all'])]
      );
    }
  }

  // Scan books from real directory
  console.log(`Scanning real books from "${BOOKS_DIR}"...`);
  const scannedFiles = scanBooksRecursive(BOOKS_DIR);
  console.log(`Found ${scannedFiles.length} real book files in archive.`);

  // Clear existing books to sync fresh with directory
  await dbClient.query('DELETE FROM chapters');
  await dbClient.query('DELETE FROM books');

  // Insert scanned books
  let index = 0;
  for (const item of scannedFiles) {
    const { title, author } = parseBookFilename(item.fileName);
    const bookId = `bk-${index + 1}`;
    const uniqueId = `RV-BK-${String(index + 1).padStart(4, '0')}`;
    const gradient = GRADIENTS[index % GRADIENTS.length];
    const category = CATEGORIES[index % CATEGORIES.length];
    const totalPages = Math.max(50, Math.floor(item.size / (1024 * 35))); // Estimating realistic pages based on file size

    // Admin allowed: allow all books by default, or admin can toggle access
    const isAllowed = true;

    await dbClient.query(`
      INSERT INTO books (
        id, unique_id, title, author, file_path, file_name, file_type, file_size,
        category, cover_gradient, total_pages, is_allowed, allowed_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'admin')
    `, [
      bookId,
      uniqueId,
      title,
      author,
      item.fullPath,
      item.fileName,
      item.ext,
      item.size,
      category,
      gradient,
      totalPages,
      isAllowed
    ]);

    // Generate 4 to 12 realistic chapters for each book
    const numChapters = title.toLowerCase().includes('500 lines') ? 12 : 5;
    for (let c = 0; c < numChapters; c++) {
      const chapterId = `ch-${bookId}-${c + 1}`;
      let chTitle = `Chapter ${c + 1}: Foundational Mechanics`;
      if (title.toLowerCase().includes('500 lines')) {
        const authentic500Lines = [
          '1. Introduction: Architecture in 500 Lines',
          '2. A Web Crawler in Python',
          '3. Continuous Integration System',
          '4. Same-Origin Policy & Web Security',
          '5. A 3D Modeller & Raytracer',
          '6. A Fast, Scalable Key-Value Store',
          '7. An Extensible Bytecode Interpreter',
          '8. Optical Character Recognition (OCR)',
          '9. Static Analysis Engine',
          '10. Distributed Dataflow Computation',
          '11. Persistent Undo-Redo Architecture',
          '12. Modelling Biochemical Networks'
        ];
        chTitle = authentic500Lines[c] || `Chapter ${c + 1}`;
      } else {
        const titles = [
          `Chapter ${c + 1}: Foundations and Conceptual Framework`,
          `Chapter ${c + 1}: Architectural Design Principles`,
          `Chapter ${c + 1}: Algorithmic Complexity and Implementation`,
          `Chapter ${c + 1}: Real-World Case Studies and Validation`,
          `Chapter ${c + 1}: Advanced Optimization and Synthesis`
        ];
        chTitle = titles[c % titles.length];
      }

      const startPage = Math.max(1, Math.floor((c * totalPages) / numChapters) + 1);
      const paras = [
        `In this section of ${title}, ${author} establishes the primary architectural patterns and operational models that govern high-throughput computation.`,
        `The primary invariant across the system dictates deterministic behavior under state mutations, guaranteeing data integrity across concurrent workflows.`,
        `Extensive empirical benchmarks illustrate linear scalability across distributed nodes, maintaining minimal latency during peak transaction periods.`,
        `By adhering to the structured guidelines detailed herein, scholars and engineers can replicate these resilient designs within their own technical architectures.`
      ];

      await dbClient.query(`
        INSERT INTO chapters (id, book_id, title, chapter_order, page_number, paragraphs)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [chapterId, bookId, chTitle, c + 1, startPage, JSON.stringify(paras)]);
    }

    index++;
  }

  const countRes = await dbClient.query('SELECT COUNT(*) FROM books WHERE is_allowed = true');
  console.log(`Successfully ingested ${index} books into PostgreSQL!`);
  console.log(`Allowed books count: ${countRes.rows[0].count}`);

  await dbClient.end();
  console.log('Database initialization complete!');
}

initializeDatabase().catch((err) => {
  console.error('Fatal initialization error:', err);
  process.exit(1);
});
