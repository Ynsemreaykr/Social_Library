namespace SocialLibrary.Application.DTOs.Feed;

public record ActivityLikeDto(
    int Id,
    int UserId,
    string Username,
    string? AvatarUrl,
    DateTime CreatedAt
);
