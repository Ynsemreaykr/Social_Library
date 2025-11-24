namespace SocialLibrary.Application.DTOs.Feed;

public record ActivityCommentDto(
    int Id,
    int UserId,
    string Username,
    string? AvatarUrl,
    string Text,
    DateTime CreatedAt
);

public record CreateActivityCommentDto(string Text);
