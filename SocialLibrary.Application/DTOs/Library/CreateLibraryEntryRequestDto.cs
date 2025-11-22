using SocialLibrary.Domain.Enums;

namespace SocialLibrary.Application.DTOs.Library;

public record CreateLibraryEntryRequestDto(
    int UserId,
    int ContentId,
    LibraryStatus Status
);
