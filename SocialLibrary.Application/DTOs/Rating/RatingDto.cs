namespace SocialLibrary.Application.DTOs.Rating;

public record RatingDto(
    int UserId,
    int ContentId,
    int Score
);
