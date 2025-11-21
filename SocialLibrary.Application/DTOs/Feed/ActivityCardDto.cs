namespace SocialLibrary.Application.DTOs.Feed;

public record ActivityCardDto(
    int ActivityId,
    string ActivityType,
    string Username,
    string? AvatarUrl,
    DateTime CreatedAt,
    string? ContentTitle,
    string? PosterUrl,
    int? Score,
    string? ReviewExcerpt,
    int LikeCount,
    int CommentCount
);
