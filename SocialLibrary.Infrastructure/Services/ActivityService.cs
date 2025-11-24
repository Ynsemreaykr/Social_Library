using Microsoft.EntityFrameworkCore;
using SocialLibrary.Application.DTOs.Feed;
using SocialLibrary.Application.Interfaces.Repositories;
using SocialLibrary.Application.Interfaces.Services;
using SocialLibrary.Domain.Entities;

namespace SocialLibrary.Infrastructure.Services;

public class ActivityService : IActivityService
{
    private readonly IActivityLikeRepository _likes;
    private readonly IActivityCommentRepository _comments;
    private readonly IActivityRepository _activities;
    private readonly IUserRepository _users;
    private readonly IUnitOfWork _uow;

    public ActivityService(
        IActivityLikeRepository likes,
        IActivityCommentRepository comments,
        IActivityRepository activities,
        IUserRepository users,
        IUnitOfWork uow)
    {
        _likes = likes;
        _comments = comments;
        _activities = activities;
        _users = users;
        _uow = uow;
    }

    public async Task LikeActivityAsync(int userId, int activityId)
    {
        // Check if activity exists
        var activity = await _activities.GetByIdAsync(activityId);
        if (activity == null)
            throw new ArgumentException("Activity not found.");

        // Check if user exists
        var user = await _users.GetByIdAsync(userId);
        if (user == null)
            throw new ArgumentException("User not found.");

        // Check if already liked
        var existingLike = await _likes.Query()
            .FirstOrDefaultAsync(l => l.UserId == userId && l.ActivityId == activityId);

        if (existingLike != null)
            return; // Already liked

        var like = new ActivityLike
        {
            UserId = userId,
            ActivityId = activityId
        };

        await _likes.AddAsync(like);
        await _uow.SaveChangesAsync();
    }

    public async Task UnlikeActivityAsync(int userId, int activityId)
    {
        var like = await _likes.Query()
            .FirstOrDefaultAsync(l => l.UserId == userId && l.ActivityId == activityId);

        if (like == null)
            return; // Not liked, nothing to do

        _likes.Delete(like);
        await _uow.SaveChangesAsync();
    }

    public async Task<bool> IsLikedAsync(int userId, int activityId)
    {
        return await _likes.Query()
            .AnyAsync(l => l.UserId == userId && l.ActivityId == activityId);
    }

    public async Task CommentActivityAsync(int userId, int activityId, string text)
    {
        if (string.IsNullOrWhiteSpace(text))
            throw new ArgumentException("Comment text cannot be empty.");

        // Check if activity exists
        var activity = await _activities.GetByIdAsync(activityId);
        if (activity == null)
            throw new ArgumentException("Activity not found.");

        // Check if user exists
        var user = await _users.GetByIdAsync(userId);
        if (user == null)
            throw new ArgumentException("User not found.");

        var comment = new ActivityComment
        {
            UserId = userId,
            ActivityId = activityId,
            Text = text
        };

        await _comments.AddAsync(comment);
        await _uow.SaveChangesAsync();
    }

    public async Task<List<ActivityCommentDto>> GetActivityCommentsAsync(int activityId)
    {
        var comments = await _comments.Query()
            .Include(c => c.User)
            .Where(c => c.ActivityId == activityId)
            .OrderBy(c => c.CreatedAt)
            .ToListAsync();

        return comments.Select(c => new ActivityCommentDto(
            Id: c.Id,
            UserId: c.UserId,
            Username: c.User.Username,
            AvatarUrl: c.User.AvatarUrl,
            Text: c.Text,
            CreatedAt: c.CreatedAt
        )).ToList();
    }

    public async Task<List<ActivityLikeDto>> GetActivityLikesAsync(int activityId)
    {
        var likes = await _likes.Query()
            .Include(l => l.User)
            .Where(l => l.ActivityId == activityId)
            .OrderBy(l => l.CreatedAt)
            .ToListAsync();

        return likes.Select(l => new ActivityLikeDto(
            Id: l.Id,
            UserId: l.UserId,
            Username: l.User.Username,
            AvatarUrl: l.User.AvatarUrl,
            CreatedAt: l.CreatedAt
        )).ToList();
    }

    public async Task<int> GetLikeCountAsync(int activityId)
    {
        return await _likes.Query()
            .CountAsync(l => l.ActivityId == activityId);
    }
}

