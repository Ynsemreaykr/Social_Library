namespace SocialLibrary.Application.DTOs.User;

public record UserListItemDto(
    int Id,
    string Username,
    string? AvatarUrl,
    string? Bio
);

