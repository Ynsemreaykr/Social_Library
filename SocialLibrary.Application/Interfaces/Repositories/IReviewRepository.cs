using SocialLibrary.Domain.Entities;

namespace SocialLibrary.Application.Interfaces.Repositories;

public interface IReviewRepository : IGenericRepository<Review>
{
    Task<Review?> GetUserReviewAsync(int userId, int contentId);
}
