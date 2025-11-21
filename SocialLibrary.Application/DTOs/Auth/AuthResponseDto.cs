namespace SocialLibrary.Application.DTOs.Auth;

public record AuthResponseDto(
    int UserId,
    string Username,
    string Email,
    string Token
);
