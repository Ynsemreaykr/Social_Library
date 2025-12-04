namespace SocialLibrary.Application.Interfaces.Services;

using SocialLibrary.Application.DTOs.Feed;
using SocialLibrary.Application.Common;

public interface IFeedService
{
    /// <summary>
    /// Get paginated feed activities for a user
    /// Returns activities from users that the specified user follows
    /// </summary>
    Task<PagedResult<ActivityCardDto>> GetFeedAsync(int userId, int page, int pageSize);

    /// <summary>
    /// Get paginated activities for a specific user (their own activities)
    /// Returns activities created by the specified user
    /// </summary>
    Task<PagedResult<ActivityCardDto>> GetUserActivitiesAsync(int userId, int page, int pageSize);
}
