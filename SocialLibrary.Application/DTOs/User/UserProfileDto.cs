namespace SocialLibrary.Application.DTOs.User;

public record UserProfileDto(
    int Id,
    string Username,
    string? AvatarUrl,
    string? Bio,
    int FollowersCount,
    int FollowingCount
);
