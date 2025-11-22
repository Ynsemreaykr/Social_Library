using SocialLibrary.Domain.Entities;

namespace SocialLibrary.Application.Interfaces.Repositories;

public interface ILibraryRepository : IGenericRepository<LibraryEntry>
{
    Task<LibraryEntry?> GetByUserAndContentAsync(int userId, int contentId);
    Task<IEnumerable<LibraryEntry>> GetByUserAsync(int userId);
}
