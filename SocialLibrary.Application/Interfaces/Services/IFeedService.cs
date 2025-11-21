namespace SocialLibrary.Application.Interfaces.Services;

using SocialLibrary.Application.DTOs.Feed;
using SocialLibrary.Application.Common;

public interface IFeedService
{
    Task<PagedResult<ActivityCardDto>> GetFeedAsync(int userId, int page, int pageSize);
}
