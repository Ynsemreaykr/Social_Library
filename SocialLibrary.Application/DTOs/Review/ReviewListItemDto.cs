namespace SocialLibrary.Application.DTOs.Review;

public record ReviewListItemDto(
    int Id,
    int UserId,
    string Username,
    string? AvatarUrl,
    string Text,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

