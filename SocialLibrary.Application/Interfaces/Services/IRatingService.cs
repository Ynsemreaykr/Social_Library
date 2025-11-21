namespace SocialLibrary.Application.Interfaces.Services;

using SocialLibrary.Application.DTOs.Rating;

public interface IRatingService
{
    Task RateAsync(int userId, int contentId, int score);
}
