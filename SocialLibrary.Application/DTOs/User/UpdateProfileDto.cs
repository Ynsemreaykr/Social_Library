namespace SocialLibrary.Application.DTOs.User;

public record UpdateProfileDto(
    string? AvatarUrl,
    string? Bio
);
