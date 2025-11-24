using Microsoft.EntityFrameworkCore;
using SocialLibrary.Application.DTOs.Review;
using SocialLibrary.Application.Interfaces.Repositories;
using SocialLibrary.Application.Interfaces.Services;
using SocialLibrary.Domain.Entities;
using SocialLibrary.Domain.Enums;

namespace SocialLibrary.Infrastructure.Services;

public class ReviewService : IReviewService
{
    private readonly IReviewRepository _reviews;
    private readonly IActivityRepository _activities;
    private readonly IContentRepository _contents;
    private readonly IUserRepository _users;
    private readonly IUnitOfWork _uow;

    public ReviewService(
        IReviewRepository reviews,
        IActivityRepository activities,
        IContentRepository contents,
        IUserRepository users,
        IUnitOfWork uow)
    {
        _reviews = reviews;
        _activities = activities;
        _contents = contents;
        _users = users;
        _uow = uow;
    }

    public async Task AddOrUpdateReviewAsync(int userId, int contentId, string text)
    {
        if (string.IsNullOrWhiteSpace(text))
            throw new ArgumentException("Review text cannot be empty.");

        // Validate that Content exists
        var content = await _contents.GetByIdAsync(contentId);
        if (content == null)
            throw new ArgumentException($"Content with ID {contentId} not found.");

        // Validate that User exists
        var user = await _users.GetByIdAsync(userId);
        if (user == null)
            throw new ArgumentException($"User with ID {userId} not found.");

        // Check if user already reviewed this content
        var existingReview = await _reviews.GetUserReviewAsync(userId, contentId);
        
        if (existingReview != null)
        {
            // Update existing review
            existingReview.Text = text;
            existingReview.UpdatedAt = DateTime.UtcNow;
            _reviews.Update(existingReview);
        }
        else
        {
            // Create new review
            var review = new Review
            {
                UserId = userId,
                ContentId = contentId,
                Text = text,
                UpdatedAt = DateTime.UtcNow
            };
            await _reviews.AddAsync(review);
            await _uow.SaveChangesAsync(); // Save to get review.Id
            
            // Create activity for review
            var activity = new Activity
            {
                UserId = userId,
                ActivityType = ActivityType.Review,
                ContentId = contentId,
                RelatedId = review.Id
            };
            await _activities.AddAsync(activity);
        }

        await _uow.SaveChangesAsync();
    }

    public async Task DeleteReviewAsync(int userId, int contentId)
    {
        var review = await _reviews.GetUserReviewAsync(userId, contentId);
        if (review == null)
            return;

        // Delete associated activity
        var activity = await _activities.Query()
            .FirstOrDefaultAsync(a => 
                a.UserId == userId && 
                a.ContentId == contentId && 
                a.ActivityType == ActivityType.Review &&
                a.RelatedId == review.Id);
        
        if (activity != null)
        {
            _activities.Delete(activity);
        }

        _reviews.Delete(review);
        await _uow.SaveChangesAsync();
    }

    public async Task<List<ReviewListItemDto>> GetContentReviewsAsync(int contentId)
    {
        var reviews = await _reviews.Query()
            .Include(r => r.User)
            .Where(r => r.ContentId == contentId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return reviews.Select(r => new ReviewListItemDto(
            Id: r.Id,
            UserId: r.UserId,
            Username: r.User.Username,
            AvatarUrl: r.User.AvatarUrl,
            Text: r.Text,
            CreatedAt: r.CreatedAt,
            UpdatedAt: r.UpdatedAt
        )).ToList();
    }

    public async Task<ReviewDto?> GetUserReviewAsync(int userId, int contentId)
    {
        var review = await _reviews.GetUserReviewAsync(userId, contentId);
        if (review == null)
            return null;

        return new ReviewDto(
            UserId: review.UserId,
            ContentId: review.ContentId,
            Text: review.Text
        );
    }
}

