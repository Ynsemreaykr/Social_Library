namespace SocialLibrary.Application.DTOs.List;

public record ListItemDto(
    int ContentId
);

public record ListItemContentDto(
    int Id,
    string? ExternalId,
    string? ContentType,
    string Title,
    string? PosterUrl,
    int? Year
);