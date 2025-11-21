namespace SocialLibrary.Application.Interfaces.Services;

using SocialLibrary.Application.DTOs.Review;

public interface IReviewService
{
    Task AddOrUpdateReviewAsync(int userId, int contentId, string text);
    Task DeleteReviewAsync(int userId, int contentId);
}
