namespace SocialLibrary.Application.DTOs.Auth;

public record RegisterRequestDto(
    string Username,
    string Email,
    string? Bio = null,
    string? AvatarUrl = null
);
