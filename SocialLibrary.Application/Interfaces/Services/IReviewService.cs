using SocialLibrary.Application.DTOs.Review;

namespace SocialLibrary.Application.Interfaces.Services;

public interface IReviewService
{
    Task AddOrUpdateReviewAsync(int userId, int contentId, string text);
    Task DeleteReviewAsync(int userId, int contentId);
    Task<List<ReviewListItemDto>> GetContentReviewsAsync(int contentId);
    Task<ReviewDto?> GetUserReviewAsync(int userId, int contentId);
}
