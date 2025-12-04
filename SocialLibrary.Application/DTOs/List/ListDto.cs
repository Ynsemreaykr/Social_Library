namespace SocialLibrary.Application.DTOs.List;

public record ListDto(
    int Id,
    string Name,
    string? Description,
    List<ListItemContentDto>? Items
);
