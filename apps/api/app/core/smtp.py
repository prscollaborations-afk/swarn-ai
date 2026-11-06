import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger("aabhushan.smtp")

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SENDER_EMAIL = os.getenv("SMTP_SENDER_EMAIL", "parthsharma17prs@gmail.com")
SMTP_APP_PASSWORD = os.getenv("SMTP_APP_PASSWORD", "")

def send_access_granted_email(to_email: str, recipient_name: str = "Jewellery Partner", credits_granted: int = 5):
    """
    Sends notification email when admin grants access to a waitlist user.
    If SMTP_APP_PASSWORD is set, dispatches real email via Gmail TLS.
    """
    subject = "🎉 Access Granted: Welcome to Aabhushan AI Studio!"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0a10; color: #f3f4f6; margin: 0; padding: 24px; }}
        .card {{ background: #161521; border: 1px solid #2d2b3b; border-radius: 16px; max-width: 600px; margin: 0 auto; overflow: hidden; }}
        .header {{ background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%); padding: 32px 24px; text-align: center; color: #0b0a10; }}
        .header h1 {{ margin: 0; font-size: 26px; font-weight: 800; }}
        .content {{ padding: 32px 24px; line-height: 1.6; color: #d1d5db; }}
        .btn {{ display: inline-block; background: #fbbf24; color: #0b0a10; text-decoration: none; padding: 14px 28px; border-radius: 9999px; font-weight: 700; font-size: 15px; margin: 20px 0; }}
        .credits-box {{ background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 12px; padding: 16px; margin: 20px 0; text-align: center; }}
        .footer {{ border-top: 1px solid #2d2b3b; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>आभूषण AI (Aabhushan AI)</h1>
          <p style="margin: 6px 0 0; font-weight: 600;">Next-Gen Visual Studio for Indian Jewellery</p>
        </div>
        <div class="content">
          <h2>Congratulations, {recipient_name}! 🎉</h2>
          <p>Your request for early access to the Aabhushan AI Platform has been officially reviewed and approved by our admin team.</p>
          
          <div class="credits-box">
            <h3 style="margin: 0; color: #fbbf24;">{credits_granted} Free HD Try-On Credits Added</h3>
            <p style="margin: 4px 0 0; font-size: 13px; color: #9ca3af;">Use them to generate catalogue-ready model try-on photos instantly.</p>
          </div>

          <div style="text-align: center;">
            <a href="http://localhost:3000/studio" class="btn">Launch Studio & Try Now &rarr;</a>
          </div>

          <p style="margin-top: 24px; font-size: 13px; color: #9ca3af;">
            If you need more credits or custom boutique enterprise onboarding, contact us directly at <a href="mailto:parthsharma17prs@gmail.com" style="color: #fbbf24;">parthsharma17prs@gmail.com</a>.
          </p>
        </div>
        <div class="footer">
          &copy; 2026 Aabhushan AI. Made exclusively for Indian Jewellery Retailers.
        </div>
      </div>
    </body>
    </html>
    """
    
    if SMTP_APP_PASSWORD:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"Aabhushan AI <{SENDER_EMAIL}>"
            msg["To"] = to_email
            msg.attach(MIMEText(html_content, "html"))
            
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
                server.starttls()
                server.login(SENDER_EMAIL, SMTP_APP_PASSWORD)
                server.sendmail(SENDER_EMAIL, [to_email], msg.as_string())
            logger.info(f"REAL SMTP EMAIL SENT to {to_email} via Gmail TLS!")
            return True
        except Exception as e:
            logger.error(f"Gmail SMTP send error: {e}")
            return False
    else:
        logger.warning(f"SMTP_APP_PASSWORD not set in .env. Email to {to_email} simulated.")
        return False
