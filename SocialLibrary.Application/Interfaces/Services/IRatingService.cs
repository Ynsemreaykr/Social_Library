using SocialLibrary.Application.DTOs.Rating;

namespace SocialLibrary.Application.Interfaces.Services;

public interface IRatingService
{
    Task RateAsync(int userId, int contentId, int score);
    Task<RatingDto?> GetUserRatingAsync(int userId, int contentId);
}
