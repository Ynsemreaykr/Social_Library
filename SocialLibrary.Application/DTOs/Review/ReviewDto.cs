namespace SocialLibrary.Application.DTOs.Review;

public record ReviewDto(
    int UserId,
    int ContentId,
    string Text
);
