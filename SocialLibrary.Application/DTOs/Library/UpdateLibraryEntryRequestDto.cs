using SocialLibrary.Domain.Enums;

namespace SocialLibrary.Application.DTOs.Library;

public record UpdateLibraryEntryRequestDto(
    LibraryStatus Status
);
