using Microsoft.Extensions.Logging;
using SocialLibrary.Application.Interfaces.Services;

namespace SocialLibrary.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;

    public EmailService(ILogger<EmailService> logger)
    {
        _logger = logger;
    }

    public async Task SendOneTimePasswordAsync(string email, string password)
    {
        // Şimdilik console'a yazdırıyoruz
        // Gerçek bir email servisi entegrasyonu için (SMTP, SendGrid, vb.) buraya eklenebilir
        _logger.LogInformation("Tek kullanımlık şifre gönderiliyor: Email: {Email}, Şifre: {Password}", email, password);
        
        // Console'a da yazdır (development için)
        Console.WriteLine($"\n=== EMAIL GÖNDERİMİ ===");
        Console.WriteLine($"Alıcı: {email}");
        Console.WriteLine($"Konu: Tek Kullanımlık Şifre");
        Console.WriteLine($"İçerik: Merhaba,\n\nHesabınız için tek kullanımlık şifreniz: {password}\n\nBu şifre ile giriş yapabilirsiniz.\n\nİyi günler!");
        Console.WriteLine($"======================\n");
        
        await Task.CompletedTask;
    }
}

