namespace SocialLibrary.Application.DTOs.Feed;

public record ActivityCardDto(
    int ActivityId,
    string ActivityType,
    int UserId,
    string Username,
    string? AvatarUrl,
    DateTime CreatedAt,
    int? ContentId,
    string? ContentTitle,
    string? PosterUrl,
    string? ContentType,
    string? ExternalId,
    int? Score,
    string? ReviewExcerpt,
    int LikeCount,
    int CommentCount
);
