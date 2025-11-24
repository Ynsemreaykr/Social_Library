namespace SocialLibrary.Application.DTOs.Auth;

public record RegisterRequestDto(
    string Username,
    string Email,
    string Password,
    string? Bio = null,
    string? AvatarUrl = null
);
