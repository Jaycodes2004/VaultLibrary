# ReadVault Administrative Mail Microservice

Dedicated secure email dispatch service for ReadVault Library administration:
- **Sender Configuration:** Configured in `.env` via `SMTP_SENDER`
- **Receiver Configuration (Admin):** Configured in `.env` via `ADMIN_RECEIVER`

---

## Capabilities

1. **New Scholar Access Notifications (`POST /notify-access-request`)**:
   Sends immediate notification to the configured administrator whenever an applicant requests library access, including their research statement, organization, and direct link to the Admin Console on Port 9000.
2. **Book Acquisition Inquiries (`POST /notify-book-request`)**:
   Alerts the administrator when a book is requested or verified in `D:\Desktop\Archive\Books`.
3. **Custom Dispatches (`POST /send-custom-admin-mail`)**:
   Dispatches custom administrative alerts.
4. **Queue & Logging Mode**:
   If no SMTP password is provided, automatically logs and stores formatted dispatches in `mail_dispatches.log` without failing.

---

## Configuration via `.env`

Copy `.env.example` to `.env` and supply your credentials:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SENDER=ipcodesjay@gmail.com
ADMIN_RECEIVER=jaysharma83502@gmail.com
SMTP_PASSWORD=your_16_char_google_app_password
```

### Setting Up Gmail App Password
Gmail requires an **App Password** (16 characters) instead of the account's standard login password:
1. Log into your Google Account.
2. Go to **Manage your Google Account** &rarr; **Security**.
3. Under **"How you sign in to Google"**, ensure **2-Step Verification** is turned ON.
4. Search or navigate to **"App passwords"** (`myaccount.google.com/apppasswords`).
5. Create a new App Password named **"ReadVault Library"**.
6. Google will generate a 16-character code (e.g. `abcd efgh ijkl mnop`).
7. Paste this code into `SMTP_PASSWORD` in your `.env` file.

---

## Running in Docker

Build and run using Docker Compose:
```bash
# In mail-service directory:
docker compose up -d --build
```

Or with pure Docker:
```bash
docker build -t readvault-mailer .
docker run -d -p 8025:8025 --env-file .env --name readvault-mailer readvault-mailer
```

---

## Running Standalone with Python

```bash
# Install dependencies
pip install -r requirements.txt

# Run test dispatch
python main.py --test

# Run service on port 8025
python main.py
```
Microservice will be available at `http://localhost:8025`.
Interactive Swagger UI API docs: `http://localhost:8025/docs`.
