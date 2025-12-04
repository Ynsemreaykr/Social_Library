using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;
using SocialLibrary.Application.Interfaces.Services;

namespace SocialLibrary.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendPasswordResetEmailAsync(string email, string resetToken, string resetLink)
    {
        string? smtpHost = null;
        int smtpPort = 587;
        string? smtpUsername = null;
        string? smtpPassword = null;
        
        try
        {
            _logger.LogInformation("========================================");
            _logger.LogInformation("[EmailService] SendPasswordResetEmailAsync BAŞLADI");
            _logger.LogInformation("[EmailService] To: {Email}", email);
            _logger.LogInformation("[EmailService] ResetLink: {ResetLink}", resetLink);
            
            // Nested yapıyı destekle (Email:Smtp:Host) - eski flat yapıyı da destekle (Email:SmtpHost)
            smtpHost = _configuration["Email:Smtp:Host"] 
                ?? _configuration["Email:SmtpHost"] 
                ?? "smtp.gmail.com";
            var smtpPortStr = _configuration["Email:Smtp:Port"] 
                ?? _configuration["Email:SmtpPort"] 
                ?? "587";
            smtpPort = int.Parse(smtpPortStr);
            smtpUsername = _configuration["Email:Smtp:Username"] 
                ?? _configuration["Email:SmtpUsername"] 
                ?? throw new Exception("Email:Smtp:Username or Email:SmtpUsername not configured");
            smtpPassword = _configuration["Email:Smtp:Password"] 
                ?? _configuration["Email:SmtpPassword"] 
                ?? throw new Exception("Email:Smtp:Password or Email:SmtpPassword not configured");
            var fromEmail = _configuration["Email:Smtp:FromEmail"] 
                ?? _configuration["Email:FromEmail"] 
                ?? smtpUsername;
            var fromName = _configuration["Email:Smtp:FromName"] 
                ?? _configuration["Email:FromName"] 
                ?? "SocialLibrary";

            _logger.LogInformation("[EmailService] SMTP Ayarları:");
            _logger.LogInformation("  Host: {Host}", smtpHost);
            _logger.LogInformation("  Port: {Port}", smtpPort);
            _logger.LogInformation("  Username: {Username}", smtpUsername);
            _logger.LogInformation("  FromEmail: {FromEmail}", fromEmail);
            _logger.LogInformation("  FromName: {FromName}", fromName);
            _logger.LogInformation("  Password Length: {Length}", smtpPassword?.Length ?? 0);

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(fromName, fromEmail));
            message.To.Add(new MailboxAddress("", email));
            message.Subject = "Şifre Sıfırlama - SocialLibrary";

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #007bff; color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 20px; background-color: #f9f9f9; }}
        .button {{ display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
        .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>📚 SocialLibrary</h1>
        </div>
        <div class='content'>
            <h2>Şifre Sıfırlama İsteği</h2>
            <p>Merhaba,</p>
            <p>Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
            <p style='text-align: center;'>
                <a href='{resetLink}' class='button'>Şifremi Sıfırla</a>
            </p>
            <p>Veya aşağıdaki linki tarayıcınıza kopyalayın:</p>
            <p style='word-break: break-all; background-color: #fff; padding: 10px; border-radius: 5px;'>
                {resetLink}
            </p>
            <p><strong>Not:</strong> Bu link 1 saat içinde geçerlidir.</p>
            <p>Eğer bu isteği siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
        </div>
        <div class='footer'>
            <p>© 2024 SocialLibrary. Tüm hakları saklıdır.</p>
        </div>
    </div>
</body>
</html>",
                TextBody = $@"
Şifre Sıfırlama İsteği

Merhaba,

Şifrenizi sıfırlamak için aşağıdaki linke tıklayın:

{resetLink}

Not: Bu link 1 saat içinde geçerlidir.

Eğer bu isteği siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.

© 2024 SocialLibrary. Tüm hakları saklıdır."
            };

            message.Body = bodyBuilder.ToMessageBody();

            _logger.LogInformation("[EmailService] MimeMessage oluşturuldu");
            _logger.LogInformation("[EmailService] SMTP bağlantısı kuruluyor... Host: {Host}, Port: {Port}", smtpHost, smtpPort);
            
            using var client = new SmtpClient();
            
            try
            {
                await client.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls);
                _logger.LogInformation("[EmailService] ✅ SMTP bağlantısı BAŞARILI");
            }
            catch (Exception connectEx)
            {
                _logger.LogError(connectEx, "[EmailService] ❌ SMTP BAĞLANTI HATASI!");
                _logger.LogError("[EmailService] Host: {Host}, Port: {Port}", smtpHost, smtpPort);
                _logger.LogError("[EmailService] Error: {Error}", connectEx.Message);
                throw new Exception($"SMTP bağlantı hatası: {connectEx.Message}", connectEx);
            }
            
            try
            {
                _logger.LogInformation("[EmailService] SMTP authentication yapılıyor... Username: {Username}", smtpUsername);
                await client.AuthenticateAsync(smtpUsername, smtpPassword);
                _logger.LogInformation("[EmailService] ✅ SMTP authentication BAŞARILI");
            }
            catch (Exception authEx)
            {
                _logger.LogError(authEx, "[EmailService] ❌ SMTP AUTHENTICATION HATASI!");
                _logger.LogError("[EmailService] Username: {Username}", smtpUsername);
                _logger.LogError("[EmailService] Password Length: {Length}", smtpPassword?.Length ?? 0);
                _logger.LogError("[EmailService] Error: {Error}", authEx.Message);
                await client.DisconnectAsync(true);
                throw new Exception($"SMTP authentication hatası: {authEx.Message}. Kullanıcı adı veya şifre yanlış olabilir.", authEx);
            }
            
            try
            {
                _logger.LogInformation("[EmailService] Email gönderiliyor... To: {Email}", email);
                await client.SendAsync(message);
                _logger.LogInformation("[EmailService] ✅ Email BAŞARIYLA GÖNDERİLDİ!");
            }
            catch (Exception sendEx)
            {
                _logger.LogError(sendEx, "[EmailService] ❌ EMAIL GÖNDERME HATASI!");
                _logger.LogError("[EmailService] To: {Email}", email);
                _logger.LogError("[EmailService] Error: {Error}", sendEx.Message);
                await client.DisconnectAsync(true);
                throw new Exception($"Email gönderme hatası: {sendEx.Message}", sendEx);
            }
            
            await client.DisconnectAsync(true);
            _logger.LogInformation("[EmailService] SMTP bağlantısı kapatıldı");
            _logger.LogInformation("[EmailService] ✅ Password reset email başarıyla gönderildi - To: {Email}", email);
            _logger.LogInformation("========================================");
        }
        catch (Exception ex)
        {
            _logger.LogError("========================================");
            _logger.LogError(ex, "[EmailService] ❌❌❌ KRİTİK HATA - Email gönderme başarısız!");
            _logger.LogError("[EmailService] To: {Email}", email);
            _logger.LogError("[EmailService] Error Message: {ErrorMessage}", ex.Message);
            _logger.LogError("[EmailService] Error Type: {ErrorType}", ex.GetType().Name);
            if (ex.InnerException != null)
            {
                _logger.LogError("[EmailService] Inner Exception: {InnerException}", ex.InnerException.Message);
                _logger.LogError("[EmailService] Inner Exception Type: {InnerType}", ex.InnerException.GetType().Name);
            }
            _logger.LogError("[EmailService] StackTrace: {StackTrace}", ex.StackTrace);
            _logger.LogError("========================================");
            throw;
        }
    }
}

