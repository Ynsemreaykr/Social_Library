namespace SocialLibrary.Application.Interfaces.Services;

using SocialLibrary.Application.DTOs.Library;

public interface ILibraryService
{
    Task UpdateLibraryEntryAsync(int userId, int contentId, string entryType);
}
