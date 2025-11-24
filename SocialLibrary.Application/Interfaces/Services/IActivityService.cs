using SocialLibrary.Application.DTOs.Feed;

namespace SocialLibrary.Application.Interfaces.Services;

public interface IActivityService
{
    Task LikeActivityAsync(int userId, int activityId);
    Task UnlikeActivityAsync(int userId, int activityId);
    Task<bool> IsLikedAsync(int userId, int activityId);
    Task CommentActivityAsync(int userId, int activityId, string text);
    Task<List<ActivityCommentDto>> GetActivityCommentsAsync(int activityId);
    Task<List<ActivityLikeDto>> GetActivityLikesAsync(int activityId);
    Task<int> GetLikeCountAsync(int activityId);
}
