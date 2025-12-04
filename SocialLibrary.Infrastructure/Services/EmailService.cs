using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SocialLibrary.Application.Interfaces.Services;
using System.Net;
using System.Net.Mail;

namespace SocialLibrary.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;
    private readonly IConfiguration _configuration;
    private readonly string? _smtpHost;
    private readonly int _smtpPort;
    private readonly string? _smtpUsername;
    private readonly string? _smtpPassword;
    private readonly string? _smtpFromEmail;
    private readonly string? _smtpFromName;
    private readonly bool _enableSsl;

    public EmailService(ILogger<EmailService> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
        
        // SMTP ayarlarını appsettings.json'dan oku
        _smtpHost = _configuration["Email:Smtp:Host"];
        _smtpPort = int.Parse(_configuration["Email:Smtp:Port"] ?? "587");
        _smtpUsername = _configuration["Email:Smtp:Username"];
        _smtpPassword = _configuration["Email:Smtp:Password"];
        _smtpFromEmail = _configuration["Email:Smtp:FromEmail"];
        _smtpFromName = _configuration["Email:Smtp:FromName"] ?? "SocialLibrary";
        _enableSsl = bool.Parse(_configuration["Email:Smtp:EnableSsl"] ?? "true");
    }

    public async Task SendOneTimePasswordAsync(string email, string password)
    {
        try
        {
            // Eğer SMTP ayarları yapılandırılmamışsa, sadece console'a yazdır
            if (string.IsNullOrEmpty(_smtpHost) || string.IsNullOrEmpty(_smtpUsername) || string.IsNullOrEmpty(_smtpPassword))
            {
                _logger.LogWarning("SMTP ayarları yapılandırılmamış. Email console'a yazdırılıyor.");
                Console.WriteLine($"\n📧 EMAIL GÖNDERİMİ (SMTP Yapılandırılmamış) 📧");
                Console.WriteLine($"Alıcı: {email}");
                Console.WriteLine($"Konu: Tek Kullanımlık Şifre");
                Console.WriteLine($"İçerik: Merhaba,\n\nHesabınız için tek kullanımlık şifreniz: {password}\n\nBu şifre ile giriş yapabilirsiniz.\n\nİyi günler!");
                Console.WriteLine($"==========================================\n");
                return;
            }

            // SMTP ile gerçek email gönder
            Console.WriteLine($"\n📤 EMAIL GÖNDERİMİ BAŞLIYOR...");
            Console.WriteLine($"SMTP Host: {_smtpHost}");
            Console.WriteLine($"SMTP Port: {_smtpPort}");
            Console.WriteLine($"SMTP Username: {_smtpUsername}");
            Console.WriteLine($"SMTP Password: {(_smtpPassword?.Length > 0 ? "***" + _smtpPassword.Substring(Math.Max(0, _smtpPassword.Length - 4)) : "BOŞ")}");
            Console.WriteLine($"Alıcı: {email}");
            Console.WriteLine($"Şifre: {password}");
            
            using (var client = new SmtpClient(_smtpHost, _smtpPort))
            {
                client.EnableSsl = _enableSsl;
                client.Credentials = new NetworkCredential(_smtpUsername, _smtpPassword);
                client.Timeout = 30000; // 30 saniye timeout

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(_smtpFromEmail ?? _smtpUsername, _smtpFromName),
                    Subject = "Tek Kullanımlık Şifre - SocialLibrary",
                    Body = $@"
Merhaba,

Hesabınız için tek kullanımlık şifreniz: <strong>{password}</strong>

Bu şifre ile giriş yapabilirsiniz.

Not: Bu şifre tek kullanımlıktır ve güvenliğiniz için başkalarıyla paylaşmayın.

İyi günler!
SocialLibrary Ekibi
                    ",
                    IsBodyHtml = true
                };

                mailMessage.To.Add(email);

                Console.WriteLine($"Email gönderiliyor...");
                
                try
                {
                    await client.SendMailAsync(mailMessage);
                    _logger.LogInformation("✅ Email başarıyla gönderildi: {Email}", email);
                    Console.WriteLine($"\n✅ EMAIL BAŞARIYLA GÖNDERİLDİ ✅");
                    Console.WriteLine($"Alıcı: {email}");
                    Console.WriteLine($"Şifre: {password}");
                    Console.WriteLine($"Gmail'inizi kontrol edin (Spam klasörünü de kontrol edin!)");
                    Console.WriteLine($"==========================================\n");
                }
                catch (SmtpException smtpEx)
                {
                    Console.WriteLine($"\n❌ SMTP HATASI ❌");
                    Console.WriteLine($"Hata Kodu: {smtpEx.StatusCode}");
                    Console.WriteLine($"Hata Mesajı: {smtpEx.Message}");
                    throw; // Exception'ı yukarı fırlat
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Email gönderilirken hata oluştu: {Email}, Hata: {Error}", email, ex.Message);
            
            // Detaylı hata mesajı console'a yazdır
            Console.WriteLine($"\n❌ EMAIL GÖNDERİM HATASI ❌");
            Console.WriteLine($"Alıcı: {email}");
            Console.WriteLine($"Hata Tipi: {ex.GetType().Name}");
            Console.WriteLine($"Hata Mesajı: {ex.Message}");
            
            // Gmail özel hata mesajları
            if (ex.Message.Contains("Authentication Required") || ex.Message.Contains("5.7.0") || ex.Message.Contains("Authentication"))
            {
                Console.WriteLine($"\n⚠️  GMAIL AUTHENTICATION HATASI ⚠️");
                Console.WriteLine($"Gmail normal şifrenizle SMTP çalışmaz!");
                Console.WriteLine($"App Password oluşturmanız gerekiyor:");
                Console.WriteLine($"1. https://myaccount.google.com/ → Güvenlik");
                Console.WriteLine($"2. 2 Adımlı Doğrulama açık olmalı");
                Console.WriteLine($"3. 'Uygulama şifreleri' → Yeni oluştur");
                Console.WriteLine($"4. Oluşan 16 haneli şifreyi appsettings.json'a yazın");
                Console.WriteLine($"\n📝 Şu anki Password değeri: {(_smtpPassword?.Length > 0 ? "***" + _smtpPassword.Substring(Math.Max(0, _smtpPassword.Length - 4)) : "BOŞ")}");
            }
            
            Console.WriteLine($"\n📧 Şifre (manuel gönderim için): {password}");
            Console.WriteLine($"==========================================\n");
            
            // Hata durumunda exception fırlat ki frontend'e hata mesajı gitsin
            // Ama önce console'a yazdırdık, kullanıcı manuel gönderebilir
            var errorMessage = $"Email gönderilemedi: {ex.Message}";
            if (ex.Message.Contains("Authentication Required") || ex.Message.Contains("5.7.0"))
            {
                errorMessage += " Gmail App Password kullanmanız gerekiyor. Backend console'unu kontrol edin.";
            }
            throw new Exception(errorMessage);
        }
    }
}

