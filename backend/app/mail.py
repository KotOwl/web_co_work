import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import get_settings

settings = get_settings()

def send_reset_password_email(email_to: str, token: str):
    # If no credentials are provided, we provide a clickable test link in the logs
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        reset_link = f"http://localhost:3000/reset-password?token={token}"
        print("\n" + "="*50)
        print(" [TEST MODE] PASSWORD RESET REQUEST")
        print(f" User: {email_to}")
        print(f" Click this link to reset password: {reset_link}")
        print("="*50 + "\n")
        return

    subject = "Відновлення пароля - Finance Tracker"
    # In a real app, this would be a link to your frontend reset page
    reset_link = f"http://localhost:3000/reset-password?token={token}"
    
    html_content = f"""
    <html>
        <body style="font-family: sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #6366f1; text-align: center;">Finance Tracker</h2>
                <p>Вітаємо!</p>
                <p>Ви отримали цей лист, тому що ми отримали запит на відновлення пароля для вашого облікового запису.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{reset_link}" 
                       style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                        Скинути пароль
                    </a>
                </div>
                <p>Це посилання буде дійсним протягом 15 хвилин.</p>
                <p>Якщо ви не робили цього запиту, просто ігноруйте цей лист.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #999; text-align: center;">
                    Це автоматичне повідомлення, будь ласка, не відповідайте на нього.
                </p>
            </div>
        </body>
    </html>
    """

    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = settings.SMTP_FROM_EMAIL or settings.SMTP_USER
    message["To"] = email_to
    
    message.attach(MIMEText(html_content, "html"))

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            if settings.SMTP_TLS:
                server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(message["From"], email_to, message.as_string())
        print(f"Reset email sent to {email_to}")
    except Exception as e:
        print(f"Failed to send email to {email_to}: {str(e)}")
