using SocialLibrary.Domain.Entities;

namespace SocialLibrary.Application.Interfaces.Repositories;

public interface ILibraryRepository : IGenericRepository<LibraryEntry>
{
    Task<LibraryEntry?> GetEntryAsync(int userId, int contentId);
}
