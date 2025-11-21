namespace SocialLibrary.Application.DTOs.Feed;

public record ActivityCommentDto(
    string Username,
    string Text,
    DateTime CreatedAt
);
