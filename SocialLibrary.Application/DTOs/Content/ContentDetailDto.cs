namespace SocialLibrary.Application.DTOs.Content;

public record ContentDetailDto(
    int Id,
    string ExternalId,
    string Title,
    string? PosterUrl,
    int? Year,
    string? Summary,
    double AverageRating,
    int RatingCount,
    string? ExtraJson
);
