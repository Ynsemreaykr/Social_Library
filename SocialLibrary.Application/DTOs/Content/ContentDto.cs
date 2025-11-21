namespace SocialLibrary.Application.DTOs.Content;

public record ContentDto(
    int Id,
    string Title,
    string? Description,
    string? CoverUrl,
    int? Year
);

public record CreateContentRequestDto(
    string Title,
    string? Description,
    string? CoverUrl,
    int? Year
);

public record UpdateContentRequestDto(
    string Title,
    string? Description,
    string? CoverUrl,
    int? Year
);
