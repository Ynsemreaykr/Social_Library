using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialLibrary.Application.Common;
using SocialLibrary.Application.DTOs.Feed;
using SocialLibrary.Application.Interfaces.Services;
using System.Security.Claims;

namespace SocialLibrary.Server.Controllers;

/// <summary>
/// Feed Controller
/// Handles feed (activity timeline) endpoints
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize] // All endpoints require authentication
public class FeedController : ControllerBase
{
    private readonly IFeedService _feedService;

    public FeedController(IFeedService feedService)
    {
        _feedService = feedService;
    }

    /// <summary>
    /// Get feed for current logged in user
    /// Returns activities from users that the current user follows
    /// </summary>
    [HttpGet("me")]
    public async Task<ActionResult<PagedResult<ActivityCardDto>>> GetMyFeed(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 15)
    {
        // Get current user ID from JWT token
        // The JWT token contains user ID in the "sub" claim (JWT standard)
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
            ?? User.FindFirst("sub")?.Value; // JWT Sub claim
        
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized("Invalid user token");
        }

        var result = await _feedService.GetFeedAsync(userId, page, pageSize);
        
        // DEBUG: Backend'den dönen activity'leri logla
        if (result.Items != null && result.Items.Any())
        {
            var firstActivity = result.Items.First();
            Console.WriteLine("========================================");
            Console.WriteLine($"[FeedController] GetMyFeed - İlk activity:");
            Console.WriteLine($"  ActivityId: {firstActivity.ActivityId}");
            Console.WriteLine($"  UserId: {firstActivity.UserId}");
            Console.WriteLine($"  Username: {firstActivity.Username}");
            Console.WriteLine($"  ActivityType: {firstActivity.ActivityType}");
            Console.WriteLine($"  Toplam {result.Items.Count()} activity döndürülüyor");
            Console.WriteLine("========================================");
        }
        
        return Ok(result);
    }

    /// <summary>
    /// Get feed for a specific user (activities from users they follow)
    /// </summary>
    [HttpGet("user/{userId:int}")]
    [AllowAnonymous] // Can view any user's feed
    public async Task<ActionResult<PagedResult<ActivityCardDto>>> GetUserFeed(
        int userId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 15)
    {
        var result = await _feedService.GetFeedAsync(userId, page, pageSize);
        return Ok(result);
    }

    /// <summary>
    /// Get activities for a specific user (their own activities)
    /// </summary>
    [HttpGet("user/{userId:int}/activities")]
    [AllowAnonymous] // Can view any user's activities
    public async Task<ActionResult<PagedResult<ActivityCardDto>>> GetUserActivities(
        int userId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 15)
    {
        var result = await _feedService.GetUserActivitiesAsync(userId, page, pageSize);
        return Ok(result);
    }
}

