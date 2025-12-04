using AutoMapper;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SocialLibrary.Application.DTOs.Auth;
using SocialLibrary.Application.Interfaces.Repositories;
using SocialLibrary.Application.Interfaces.Services;
using SocialLibrary.Domain.Entities;
using SocialLibrary.Infrastructure.Identity;

namespace SocialLibrary.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _users;
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;
    private readonly JwtTokenGenerator _jwt;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IUserRepository users,
        IUnitOfWork uow,
        IMapper mapper,
        JwtTokenGenerator jwt,
        IEmailService emailService,
        IConfiguration configuration,
        ILogger<AuthService> logger)
    {
        _users = users;
        _uow = uow;
        _mapper = mapper;
        _jwt = jwt;
        _emailService = emailService;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto dto)
    {
        // email veya username kullanımda mı?
        if (await _users.AnyAsync(dto.Email, dto.Username))
            throw new Exception("Email or username already taken.");

        var user = _mapper.Map<User>(dto);
        user.PasswordHash = PasswordHasher.Hash(dto.Password);

        await _users.AddAsync(user);
        await _uow.SaveChangesAsync();

        var token = _jwt.GenerateToken(user.Id, user.Username, user.Email);

        return new AuthResponseDto(
            UserId: user.Id,
            Username: user.Username,
            Email: user.Email,
            Token: token
        );
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto dto)
    {
        var user = await _users.GetByEmailAsync(dto.Email);
        if (user == null)
            throw new Exception("User not found.");

        var hash = PasswordHasher.Hash(dto.Password);
        if (user.PasswordHash != hash)
            throw new Exception("Invalid password.");

        var token = _jwt.GenerateToken(user.Id, user.Username, user.Email);

        return new AuthResponseDto(
            UserId: user.Id,
            Username: user.Username,
            Email: user.Email,
            Token: token
        );
    }

    public async Task ForgotPasswordAsync(string email)
    {
        _logger.LogInformation("========================================");
        _logger.LogInformation("[AuthService] ForgotPasswordAsync başladı - Email: {Email}", email);
        _logger.LogInformation("[AuthService] Email (lowercase): {EmailLower}", email.ToLower());
        
        var user = await _users.GetByEmailAsync(email);
        if (user == null)
        {
            _logger.LogWarning("[AuthService] ⚠️ Kullanıcı bulunamadı - Email: {Email}", email);
            _logger.LogWarning("[AuthService] Email gönderilmeyecek (güvenlik nedeniyle)");
            _logger.LogInformation("========================================");
            // Güvenlik için: Kullanıcı yoksa da başarılı mesajı döndür
            // Böylece email adreslerinin sistemde olup olmadığını öğrenemezler
            return;
        }
        
        _logger.LogInformation("[AuthService] ✅ Kullanıcı bulundu!");
        _logger.LogInformation("[AuthService] UserId: {UserId}", user.Id);
        _logger.LogInformation("[AuthService] Username: {Username}", user.Username);
        _logger.LogInformation("[AuthService] Email (DB): {Email}", user.Email);

        _logger.LogInformation("[AuthService] Kullanıcı bulundu - UserId: {UserId}, Email: {Email}", user.Id, user.Email);

        // Mevcut geçerli token varsa onu kullan, yoksa yeni oluştur
        var existingToken = await _uow.PasswordResetTokens.GetValidTokenByUserIdAsync(user.Id);
        string token;
        
        if (existingToken != null)
        {
            _logger.LogInformation("[AuthService] Mevcut token kullanılıyor - Token: {TokenPrefix}...", existingToken.Token.Substring(0, Math.Min(20, existingToken.Token.Length)));
            token = existingToken.Token;
        }
        else
        {
            // Yeni token oluştur
            token = Guid.NewGuid().ToString() + "-" + Guid.NewGuid().ToString();
            _logger.LogInformation("[AuthService] Yeni token oluşturuldu - Token: {TokenPrefix}...", token.Substring(0, Math.Min(20, token.Length)));
            
            var resetToken = new PasswordResetToken
            {
                UserId = user.Id,
                Token = token,
                ExpiresAt = DateTime.UtcNow.AddHours(1), // 1 saat geçerli
                Used = false
            };

            await _uow.PasswordResetTokens.AddAsync(resetToken);
            await _uow.SaveChangesAsync();
            _logger.LogInformation("[AuthService] Token veritabanına kaydedildi");
        }

        // Reset link oluştur
        // Development'ta backend'den serve ediliyorsa backend URL'ini kullan
        // Production'da frontend URL'ini kullan
        var frontendUrl = _configuration["Frontend:Url"] ?? "http://localhost:5162";
        var resetLink = $"{frontendUrl}/reset-password?token={token}";
        _logger.LogInformation("[AuthService] Reset link oluşturuldu: {ResetLink}", resetLink);
        _logger.LogInformation("[AuthService] Frontend URL: {FrontendUrl}", frontendUrl);

        // Email gönder
        try
        {
            _logger.LogInformation("[AuthService] ========================================");
            _logger.LogInformation("[AuthService] Email gönderiliyor - To: {Email}", user.Email);
            _logger.LogInformation("[AuthService] ResetLink: {ResetLink}", resetLink);
            await _emailService.SendPasswordResetEmailAsync(user.Email, token, resetLink);
            _logger.LogInformation("[AuthService] ✅ Email başarıyla gönderildi - To: {Email}", user.Email);
            _logger.LogInformation("[AuthService] ========================================");
        }
        catch (Exception ex)
        {
            _logger.LogError("========================================");
            _logger.LogError(ex, "[AuthService] ❌ Email gönderme hatası!");
            _logger.LogError("[AuthService] To: {Email}", user.Email);
            _logger.LogError("[AuthService] Error: {ErrorMessage}", ex.Message);
            _logger.LogError("[AuthService] StackTrace: {StackTrace}", ex.StackTrace);
            _logger.LogError("========================================");
            throw; // Exception'ı tekrar fırlat ki controller'a ulaşsın
        }
    }

    public async Task ResetPasswordAsync(string token, string newPassword)
    {
        var resetToken = await _uow.PasswordResetTokens.GetByTokenAsync(token);
        
        if (resetToken == null)
            throw new Exception("Geçersiz veya süresi dolmuş token.");

        if (resetToken.Used)
            throw new Exception("Bu token daha önce kullanılmış.");

        if (resetToken.ExpiresAt < DateTime.UtcNow)
            throw new Exception("Token süresi dolmuş.");

        // Şifreyi güncelle
        var user = resetToken.User;
        user.PasswordHash = PasswordHasher.Hash(newPassword);

        // Token'ı kullanıldı olarak işaretle
        resetToken.Used = true;

        await _uow.SaveChangesAsync();
    }
}
