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

    public AuthService(
        IUserRepository users,
        IUnitOfWork uow,
        IMapper mapper,
        JwtTokenGenerator jwt)
    {
        _users = users;
        _uow = uow;
        _mapper = mapper;
        _jwt = jwt;
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
}
