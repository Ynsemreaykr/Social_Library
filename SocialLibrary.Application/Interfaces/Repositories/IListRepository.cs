using SocialLibrary.Domain.Entities;

namespace SocialLibrary.Application.Interfaces.Repositories;

public interface IListRepository : IGenericRepository<List>
{
    Task<IEnumerable<List>> GetUserListsAsync(int userId);
}
