using SocialLibrary.Application.DTOs.Content;
using SocialLibrary.Domain.Enums;

namespace SocialLibrary.Application.DTOs.Library;

public record LibraryEntryDto(
    int Id,
    int UserId,
    int ContentId,
    LibraryStatus Status,
    DateTime CreatedAt,
    ContentDto? Content = null // Content bilgisini de ekle
);
