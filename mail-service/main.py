import os
import sys
import json
import smtplib
import logging
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("ReadVaultAdminMailer")

# Automatically load .env file if present
_env_path = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(_env_path):
    try:
        with open(_env_path, "r", encoding="utf-8") as _f:
            for _line in _f:
                _line = _line.strip()
                if _line and not _line.startswith("#") and "=" in _line:
                    _k, _v = _line.split("=", 1)
                    os.environ.setdefault(_k.strip(), _v.strip())
    except Exception as _e:
        logger.warning(f"Could not read .env: {_e}")

# Configuration (from Environment Variables or defaults)
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_SENDER = os.getenv("SMTP_SENDER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")  # 16-character Google App Password
ADMIN_RECEIVER = os.getenv("ADMIN_RECEIVER", "")


def send_email_smtp(subject: str, html_body: str, plain_body: str, receiver: str = ADMIN_RECEIVER) -> dict:
    """Sends an email using Gmail SMTP or records dispatch in log if App Password is unset."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"ReadVault Security Gateway <{SMTP_SENDER}>"
    msg["To"] = receiver

    part1 = MIMEText(plain_body, "plain", "utf-8")
    part2 = MIMEText(html_body, "html", "utf-8")
    msg.attach(part1)
    msg.attach(part2)

    # If App Password is not provided, record in dispatch queue log
    if not SMTP_PASSWORD or SMTP_PASSWORD == "your_app_password_here":
        log_entry = (
            f"\n------------------------------------------------------------\n"
            f"[DISPATCH LOG] {timestamp}\n"
            f"FROM: {SMTP_SENDER}\n"
            f"TO:   {receiver}\n"
            f"SUBJ: {subject}\n"
            f"BODY: {plain_body}\n"
            f"STATUS: Logged in Queue (Set SMTP_PASSWORD with Gmail App Password to transmit live over SMTP)\n"
            f"------------------------------------------------------------\n"
        )
        with open("mail_dispatches.log", "a", encoding="utf-8") as f:
            f.write(log_entry)
        logger.info(f"Simulated dispatch stored in mail_dispatches.log for {receiver}")
        return {
            "success": True,
            "mode": "logged_to_dispatch_queue",
            "sender": SMTP_SENDER,
            "receiver": receiver,
            "subject": subject,
            "note": "To transmit live, provide 16-character Google App Password in SMTP_PASSWORD environment variable."
        }

    # Live SMTP Dispatch
    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(SMTP_SENDER, SMTP_PASSWORD)
            server.sendmail(SMTP_SENDER, [receiver], msg.as_string())
            logger.info(f"Live email dispatched successfully from {SMTP_SENDER} to {receiver}")
            return {
                "success": True,
                "mode": "live_smtp_sent",
                "sender": SMTP_SENDER,
                "receiver": receiver,
                "subject": subject
            }
    except Exception as e:
        logger.error(f"SMTP Transmission Error: {e}")
        return {
            "success": False,
            "error": str(e),
            "sender": SMTP_SENDER,
            "receiver": receiver
        }


def format_access_request_email(full_name: str, email: str, organization: str, purpose: str, desired_tier: str, request_id: str = ""):
    subject = f"[ReadVault Alert] New Library Access Request: {full_name}"

    plain_body = f"""
NEW LIBRARY ACCESS REQUEST PENDING APPROVAL
--------------------------------------------------
Applicant Scholar : {full_name}
Email Address     : {email}
Institution       : {organization or 'Independent Scholar'}
Desired Tier      : {desired_tier.upper()}
Request Reference : {request_id or 'REQ-LIVE'}

Statement of Purpose / Need:
"{purpose}"

--------------------------------------------------
Administrative Review Link:
http://localhost:9000/portal-auth-x98q
(or LAN: http://192.168.1.54:9000/portal-auth-x98q)

Sender: {SMTP_SENDER}
Administrator: {ADMIN_RECEIVER}
"""

    html_body = f"""
<!DOCTYPE html>
<html>
<head>
  <style>
    body {{ font-family: 'Segoe UI', Arial, sans-serif; background-color: #0b0f19; color: #ede5da; padding: 20px; }}
    .card {{ background: #131a2a; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 28px; max-width: 580px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }}
    .header {{ border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 16px; margin-bottom: 20px; }}
    .badge {{ background: rgba(99, 102, 241, 0.2); color: #a5b4fc; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: bold; font-family: monospace; border: 1px solid rgba(99, 102, 241, 0.4); }}
    .field {{ margin-bottom: 12px; }}
    .label {{ font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: bold; }}
    .value {{ font-size: 14px; color: #ffffff; margin-top: 2px; font-weight: 600; }}
    .quote {{ background: rgba(0,0,0,0.3); border-left: 3px solid #8c6742; padding: 12px; font-style: italic; color: #cbd5e1; border-radius: 0 8px 8px 0; margin-top: 8px; }}
    .btn {{ display: inline-block; background: #4f46e5; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: bold; font-size: 13px; margin-top: 20px; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4); }}
    .footer {{ font-size: 11px; color: #64748b; margin-top: 24px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 14px; text-align: center; }}
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <span class="badge">RESTRICTED ACCESS LIBRARY GATEWAY</span>
      <h2 style="color: #ffffff; margin: 10px 0 0 0; font-size: 20px;">New Library Access Request</h2>
      <p style="color: #94a3b8; font-size: 12px; margin: 4px 0 0 0;">Transmitted from {SMTP_SENDER} to Chief Administrator {ADMIN_RECEIVER}</p>
    </div>

    <div class="field">
      <div class="label">Scholar Applicant</div>
      <div class="value">{full_name}</div>
    </div>

    <div class="field">
      <div class="label">Email Address</div>
      <div class="value" style="color: #818cf8; font-family: monospace;">{email}</div>
    </div>

    <div class="field">
      <div class="label">Institution / Organization</div>
      <div class="value">{organization or 'Independent Scholar'}</div>
    </div>

    <div class="field">
      <div class="label">Requested Access Tier</div>
      <div class="value" style="color: #34d399;">{desired_tier.upper()}</div>
    </div>

    <div class="field">
      <div class="label">Research Need Statement</div>
      <div class="quote">“{purpose}”</div>
    </div>

    <div style="text-align: center;">
      <a href="http://192.168.1.54:9000/portal-auth-x98q" class="btn">Open Admin Console to Grant Access</a>
    </div>

    <div class="footer">
      ReadVault Master Core • Port 9000 • Restricted Scholarly Archive
    </div>
  </div>
</body>
</html>
"""
    return subject, plain_body, html_body


# Check if FastAPI is available, otherwise use built-in http.server
try:
    from fastapi import FastAPI, BackgroundTasks
    from fastapi.middleware.cors import CORSMiddleware
    from pydantic import BaseModel
    FASTAPI_AVAILABLE = True
except ImportError:
    FASTAPI_AVAILABLE = False


if FASTAPI_AVAILABLE:
    app = FastAPI(
        title="ReadVault Administrative Mail Service",
        description="Dedicated microservice for administrative security alerts and access notifications",
        version="1.0.0"
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    class AccessReqModel(BaseModel):
        full_name: str
        email: str
        organization: str = "Independent Scholar"
        purpose: str = "General Reading"
        desired_tier: str = "scholar"
        request_id: str = ""

    class BookReqModel(BaseModel):
        scholar_name: str
        scholar_email: str
        book_title: str
        author: str
        status: str
        matched_path: str = ""

    class CustomMailModel(BaseModel):
        subject: str
        message: str

    @app.get("/")
    @app.get("/health")
    def health():
        return {
            "status": "online",
            "sender": SMTP_SENDER,
            "receiver": ADMIN_RECEIVER,
            "framework": "FastAPI",
            "live_smtp": bool(SMTP_PASSWORD and SMTP_PASSWORD != "your_app_password_here")
        }

    @app.post("/notify-access-request")
    def api_notify_access(data: AccessReqModel):
        subj, plain, html = format_access_request_email(
            data.full_name, data.email, data.organization, data.purpose, data.desired_tier, data.request_id
        )
        return send_email_smtp(subj, html, plain, ADMIN_RECEIVER)

    @app.post("/notify-book-request")
    def api_notify_book(data: BookReqModel):
        subj = f"[ReadVault Book Request] Inscribed Inquiry: {data.book_title}"
        plain = f"Book: {data.book_title} by {data.author}\nScholar: {data.scholar_name} ({data.scholar_email})\nPath: {data.matched_path}"
        html = f"<h3>Book Request</h3><p><strong>{data.book_title}</strong> by {data.author}</p><p>Scholar: {data.scholar_name}</p>"
        return send_email_smtp(subj, html, plain, ADMIN_RECEIVER)

    @app.post("/send-custom-admin-mail")
    def api_custom_mail(data: CustomMailModel):
        html = f"<div style='font-family: Arial; padding: 20px; background: #131a2a; color: #fff;'><h3>{data.subject}</h3><p>{data.message}</p></div>"
        return send_email_smtp(data.subject, html, data.message, ADMIN_RECEIVER)

else:
    # Pure Python built-in HTTP server fallback
    from http.server import HTTPServer, BaseHTTPRequestHandler

    class StandaloneMailHandler(BaseHTTPRequestHandler):
        def _set_headers(self, status=200):
            self.send_response(status)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "*")
            self.end_headers()

        def do_OPTIONS(self):
            self._set_headers(200)

        def do_GET(self):
            self._set_headers(200)
            res = {
                "status": "online",
                "sender": SMTP_SENDER,
                "receiver": ADMIN_RECEIVER,
                "framework": "Python Built-in HTTP Server",
                "live_smtp": bool(SMTP_PASSWORD and SMTP_PASSWORD != "your_app_password_here")
            }
            self.wfile.write(json.dumps(res).encode("utf-8"))

        def do_POST(self):
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length).decode("utf-8")
            data = json.loads(body) if body else {}

            if self.path == "/notify-access-request":
                subj, plain, html = format_access_request_email(
                    data.get("full_name", ""),
                    data.get("email", ""),
                    data.get("organization", "Independent Scholar"),
                    data.get("purpose", ""),
                    data.get("desired_tier", "scholar"),
                    data.get("request_id", "")
                )
                res = send_email_smtp(subj, html, plain, ADMIN_RECEIVER)
                self._set_headers(200)
                self.wfile.write(json.dumps(res).encode("utf-8"))
            elif self.path == "/notify-book-request":
                subj = f"[ReadVault Book Request] Inscribed Inquiry: {data.get('book_title', '')}"
                plain = f"Book: {data.get('book_title')} by {data.get('author')}\nScholar: {data.get('scholar_name')}"
                html = f"<h3>Book Request</h3><p><strong>{data.get('book_title')}</strong></p>"
                res = send_email_smtp(subj, html, plain, ADMIN_RECEIVER)
                self._set_headers(200)
                self.wfile.write(json.dumps(res).encode("utf-8"))
            else:
                subj = data.get("subject", "[ReadVault Admin Alert]")
                msg = data.get("message", "Administrative update")
                html = f"<div><h3>{subj}</h3><p>{msg}</p></div>"
                res = send_email_smtp(subj, html, msg, ADMIN_RECEIVER)
                self._set_headers(200)
                self.wfile.write(json.dumps(res).encode("utf-8"))


if __name__ == "__main__":
    if "--test" in sys.argv:
        print(f"=== TESTING DISPATCH FROM {SMTP_SENDER} TO {ADMIN_RECEIVER} ===")
        subj, plain, html = format_access_request_email(
            full_name="Dr. Julian Vance",
            email="j.vance@oxford-research.org",
            organization="Distributed Architecture Lab",
            purpose="Validation of the 241-volume archive access pipeline on Port 9000.",
            desired_tier="scholar",
            request_id="REQ-TEST-001"
        )
        res = send_email_smtp(subj, html, plain, ADMIN_RECEIVER)
        print("Dispatch result:", json.dumps(res, indent=2))
        print("Log check: Check mail_dispatches.log in this directory!")
    else:
        port = int(os.getenv("PORT", "8025"))
        print(f"Starting ReadVault Admin Mail Service on port {port}...")
        print(f"Sender  : {SMTP_SENDER}")
        print(f"Receiver: {ADMIN_RECEIVER}")
        if FASTAPI_AVAILABLE:
            import uvicorn
            uvicorn.run(app, host="0.0.0.0", port=port)
        else:
            server = HTTPServer(("0.0.0.0", port), StandaloneMailHandler)
            print("Running standalone HTTP server. Press Ctrl+C to stop.")
            server.serve_forever()
