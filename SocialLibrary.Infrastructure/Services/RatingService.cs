using Microsoft.EntityFrameworkCore;
using SocialLibrary.Application.DTOs.Rating;
using SocialLibrary.Application.Interfaces.Repositories;
using SocialLibrary.Application.Interfaces.Services;
using SocialLibrary.Domain.Entities;
using SocialLibrary.Domain.Enums;

namespace SocialLibrary.Infrastructure.Services;

public class RatingService : IRatingService
{
    private readonly IRatingRepository _ratings;
    private readonly IActivityRepository _activities;
    private readonly IContentRepository _contents;
    private readonly IUserRepository _users;
    private readonly IUnitOfWork _uow;

    public RatingService(
        IRatingRepository ratings,
        IActivityRepository activities,
        IContentRepository contents,
        IUserRepository users,
        IUnitOfWork uow)
    {
        _ratings = ratings;
        _activities = activities;
        _contents = contents;
        _users = users;
        _uow = uow;
    }

    public async Task RateAsync(int userId, int contentId, int score)
    {
        // Validate score range (1-10)
        if (score < 1 || score > 10)
            throw new ArgumentException("Score must be between 1 and 10.");

        // Validate that Content exists
        var content = await _contents.GetByIdAsync(contentId);
        if (content == null)
            throw new ArgumentException($"Content with ID {contentId} not found.");

        // Validate that User exists
        var user = await _users.GetByIdAsync(userId);
        if (user == null)
            throw new ArgumentException($"User with ID {userId} not found.");

        // Check if user already rated this content
        var existingRating = await _ratings.GetUserRatingAsync(userId, contentId);
        
        if (existingRating != null)
        {
            // Update existing rating
            existingRating.Score = score;
            existingRating.UpdatedAt = DateTime.UtcNow;
            _ratings.Update(existingRating);
        }
        else
        {
            // Create new rating
            var rating = new Rating
            {
                UserId = userId,
                ContentId = contentId,
                Score = score,
                UpdatedAt = DateTime.UtcNow
            };
            await _ratings.AddAsync(rating);
            await _uow.SaveChangesAsync(); // Save to get rating.Id
            
            // Create activity for rating
            var activity = new Activity
            {
                UserId = userId,
                ActivityType = ActivityType.Rating,
                ContentId = contentId,
                RelatedId = rating.Id
            };
            await _activities.AddAsync(activity);
        }

        await _uow.SaveChangesAsync();
    }

    public async Task<RatingDto?> GetUserRatingAsync(int userId, int contentId)
    {
        var rating = await _ratings.GetUserRatingAsync(userId, contentId);
        if (rating == null)
            return null;

        return new RatingDto(
            UserId: rating.UserId,
            ContentId: rating.ContentId,
            Score: rating.Score
        );
    }
}

