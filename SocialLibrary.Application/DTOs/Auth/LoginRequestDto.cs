namespace SocialLibrary.Application.DTOs.Auth;

public record LoginRequestDto(
    string Email,
    string Password
);
