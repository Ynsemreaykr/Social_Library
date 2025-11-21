using SocialLibrary.Domain.Entities;

namespace SocialLibrary.Application.Interfaces.Repositories;

public interface IRatingRepository : IGenericRepository<Rating>
{
    Task<Rating?> GetUserRatingAsync(int userId, int contentId);
}
