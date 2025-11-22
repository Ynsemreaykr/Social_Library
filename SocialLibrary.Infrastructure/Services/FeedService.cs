using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SocialLibrary.Application.Common;
using SocialLibrary.Application.DTOs.Feed;
using SocialLibrary.Application.Interfaces.Repositories;
using SocialLibrary.Application.Interfaces.Services;
using SocialLibrary.Domain.Entities;
using SocialLibrary.Domain.Enums;

namespace SocialLibrary.Infrastructure.Services;

/// <summary>
/// Feed Service Implementation
/// Handles fetching user feed activities (timeline)
/// </summary>
public class FeedService : IFeedService
{
    private readonly IActivityRepository _activities;
    private readonly IRatingRepository _ratings;
    private readonly IReviewRepository _reviews;
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public FeedService(
        IActivityRepository activities,
        IRatingRepository ratings,
        IReviewRepository reviews,
        IUnitOfWork uow,
        IMapper mapper)
    {
        _activities = activities;
        _ratings = ratings;
        _reviews = reviews;
        _uow = uow;
        _mapper = mapper;
    }

    /// <summary>
    /// Get paginated feed activities for a user
    /// Returns activities from users that the specified user follows
    /// </summary>
    public async Task<PagedResult<ActivityCardDto>> GetFeedAsync(int userId, int page, int pageSize)
    {
        // TODO: Filter by followed users when Follow functionality is implemented
        // For now, return all activities ordered by date
        
        // Get all activities with related data
        var allActivities = await _activities
            .Query()
            .Include(a => a.User)
            .Include(a => a.Content)
            .Include(a => a.Likes)
            .Include(a => a.Comments)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

        // Calculate pagination
        var totalCount = allActivities.Count;
        var items = allActivities
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        // Map to DTOs and enrich with additional data
        var activityDtos = new List<ActivityCardDto>();
        
        foreach (var activity in items)
        {
            var dto = _mapper.Map<ActivityCardDto>(activity);
            
            // Enrich with Score if it's a Rating activity
            if (activity.ActivityType == ActivityType.Rating && activity.RelatedId.HasValue)
            {
                var rating = await _ratings.GetByIdAsync(activity.RelatedId.Value);
                if (rating != null)
                {
                    dto = dto with { Score = rating.Score };
                }
            }
            
            // Enrich with ReviewExcerpt if it's a Review activity
            if (activity.ActivityType == ActivityType.Review && activity.RelatedId.HasValue)
            {
                var review = await _reviews.GetByIdAsync(activity.RelatedId.Value);
                if (review != null)
                {
                    // Get first 150-200 characters as excerpt
                    var excerpt = review.Text.Length > 200 
                        ? review.Text.Substring(0, 200) + "..." 
                        : review.Text;
                    dto = dto with { ReviewExcerpt = excerpt };
                }
            }

            // Set LikeCount and CommentCount
            dto = dto with
            {
                LikeCount = activity.Likes?.Count ?? 0,
                CommentCount = activity.Comments?.Count ?? 0,
            };

            activityDtos.Add(dto);
        }

        return new PagedResult<ActivityCardDto>
        {
            Items = activityDtos,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
        };
    }
}

