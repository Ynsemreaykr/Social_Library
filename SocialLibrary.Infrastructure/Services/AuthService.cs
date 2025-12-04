using AutoMapper;
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

    public AuthService(
        IUserRepository users,
        IUnitOfWork uow,
        IMapper mapper,
        JwtTokenGenerator jwt,
        IEmailService emailService)
    {
        _users = users;
        _uow = uow;
        _mapper = mapper;
        _jwt = jwt;
        _emailService = emailService;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto dto)
    {
        // email veya username kullanımda mı?
        if (await _users.AnyAsync(dto.Email, dto.Username))
            throw new Exception("Email or username already taken.");

        // Kullanıcının girdiği şifreyi hash'le
        var user = _mapper.Map<User>(dto);
        user.PasswordHash = PasswordHasher.Hash(dto.Password);

        await _users.AddAsync(user);
        await _uow.SaveChangesAsync();

        // Kayıt başarılı - token döndürmüyoruz, kullanıcı giriş yapmalı
        return new AuthResponseDto(
            UserId: user.Id,
            Username: user.Username,
            Email: user.Email,
            Token: string.Empty // Token döndürmüyoruz, kullanıcı giriş yapmalı
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

        // Tek kullanımlık şifre ile giriş yapıldıysa, bu şifreyi kalıcı şifre olarak kaydet
        // (Şifre zaten doğru, sadece veritabanında güncelleme yapmıyoruz çünkü hash aynı)
        // Not: Tek kullanımlık şifre zaten hash'lenmiş olarak kaydedilmiş, bu yüzden ekstra bir işlem yapmıyoruz

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
        var user = await _users.GetByEmailAsync(email);
        if (user == null)
            throw new Exception("User not found.");

        // Tek kullanımlık şifre oluştur (6 haneli rastgele sayı)
        var random = new Random();
        var oneTimePassword = random.Next(100000, 999999).ToString();

        // Eski şifreyi sil ve yeni tek kullanımlık şifreyi kaydet
        user.PasswordHash = PasswordHasher.Hash(oneTimePassword);
        
        await _uow.SaveChangesAsync();

        // Tek kullanımlık şifreyi email'e gönder
        await _emailService.SendOneTimePasswordAsync(user.Email, oneTimePassword);
    }
}
