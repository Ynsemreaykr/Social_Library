using SocialLibrary.Domain.Entities;

namespace SocialLibrary.Application.Interfaces.Repositories;

public interface IActivityRepository : IGenericRepository<Activity>
{
    Task<IEnumerable<Activity>> GetUserFeedAsync(int userId, int page, int pageSize);
}
