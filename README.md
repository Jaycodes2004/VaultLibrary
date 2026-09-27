# VaultLibrary (ReadVault) — High-Security Academic Archive & Library System

VaultLibrary is a full-stack, request-only digital library and archival management system built with Next.js, TypeScript, PostgreSQL, and a containerized Python administrative mail microservice. It is engineered for dynamic cataloging of local physical volumes, dual-mode reading (PDF & EPUB), request-gated scholar access, and local area network (LAN) deployment behind IIS reverse proxies.

---

## Key Features

- **Request-Only Scholar Access Gateway**:
  - Gated access control: Visitors can submit an academic access request or sign in with an approved institutional email.
  - Transparent applicant tracking with status updates (Pending Review, Approved, Declined).
  - Admin approval workflow: 1-click authorization instantly creates and activates scholar records in PostgreSQL.
- **Dynamic Physical Volume Management**:
  - Automatically indexes volumes from local archives (`D:\Desktop\Archive\Books`).
  - Dynamic book count and catalog queried directly from PostgreSQL (`library_db`).
  - Unique ID assignment (`ARCH-CS-...`) for every volume to ensure strict administrative tracking.
- **Dual-Engine Reader Experience (PDF & EPUB)**:
  - Interactive Table of Contents (TOC) parsing for instant chapter navigation.
  - Fullscreen immersive mode with tactile left/right navigation arrows, keyboard hotkeys, and smooth scroll.
  - Realistic handmade paper texture background scaling seamlessly across all viewport dimensions.
- **Port 9000 & LAN Readiness**:
  - Native binding on `0.0.0.0:9000` for conflict-free local network and LAN access.
  - Complete IIS reverse proxy integration via `web.config` and PowerShell automation (`deploy-iis.ps1`).
- **Dedicated Administrative Mail Microservice (`mail-service/`)**:
  - Python microservice with dual-mode server (FastAPI or zero-dependency standard library).
  - Standalone and Docker container support (`Dockerfile`, `docker-compose.yml`).
  - Dispatches immediate security alerts for new applicant access requests.
  - Configurable via `.env` with automated logging queue (`mail_dispatches.log`) when SMTP credentials are in development mode.

---

## Architecture Overview

```
VaultLibrary/
├── app/
│   ├── api/
│   │   ├── access-requests/   # Access request submission & admin approvals
│   │   ├── auth/login/        # Scholar credential authentication
│   │   ├── books/             # PostgreSQL book catalog & allowed list
│   │   ├── scan-books/        # Physical directory scanner (D:\Desktop\Archive\Books)
│   │   └── whisper/           # Voice notes & audio transcription endpoint
│   ├── login/                 # Request Library Access & Scholar Sign In
│   ├── portal-auth-x98q/      # Chief Admin Management Console
│   ├── reader/                # Advanced EPUB / PDF Reader view
│   ├── globals.css            # Custom parchment & luxury glass styling
│   └── page.tsx               # Main catalog dashboard
├── components/                # Modular UI components (Navbar, BookReader, etc.)
├── lib/
│   ├── db.ts                  # PostgreSQL connection pool & data queries
│   └── storage.ts             # LocalStorage & database sync utilities
├── mail-service/              # Administrative Python / Docker mail microservice
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example
├── scripts/                   # DB migrations, port checkers, and seeders
├── deploy-iis.ps1             # Automated Windows IIS & Firewall deployment
├── web.config                 # IIS URL Rewrite reverse proxy config
├── .env.example               # Environment variables template
└── package.json
```

---

## Getting Started

### 1. Prerequisites
- **Node.js**: v18.17+ or v20+
- **PostgreSQL**: Running locally on port `5432` with database `library_db`
- **Python**: 3.9+ (optional for mail service standalone) or **Docker**

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in both the root application and `mail-service/`:

```bash
# In library-system:
cp .env.example .env

# In mail-service:
cp mail-service/.env.example mail-service/.env
```

Configure your credentials in `.env`:
```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/library_db
PGUSER=postgres
PGPASSWORD=your_password
PGDATABASE=library_db

# Physical Books Location
BOOKS_DIR=D:\Desktop\Archive\Books

# Port & Mailer
PORT=9000
ADMIN_EMAIL=your_admin_email@gmail.com
SMTP_SENDER=your_sender_email@gmail.com
MAIL_SERVICE_URL=http://127.0.0.1:8025
```

### 3. Initialize the Database
Ensure PostgreSQL is running and run the table creation and book index scripts:
```bash
node scripts/create-access-requests-table.js
node scripts/scan-books.js
```

### 4. Start the Application
Run the Next.js development server on **Port 9000**:
```bash
npm run dev
```
Open [http://localhost:9000](http://localhost:9000) or your LAN IP `http://<YOUR-IP>:9000`.

### 5. Start the Mail Microservice
**Option A — Python Standalone:**
```bash
cd mail-service
pip install -r requirements.txt
python main.py
```

**Option B — Docker Compose:**
```bash
cd mail-service
docker compose up -d --build
```

---

## Administrative Endpoints

- **Public Access Request / Scholar Login**: `/login`
- **Chief Admin Console**: `/portal-auth-x98q`
- **Mail Microservice Health Check**: `http://localhost:8025/health`

---

## License
MIT License — Created for secure academic archive management.
