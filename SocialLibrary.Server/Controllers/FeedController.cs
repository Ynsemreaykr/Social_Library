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
        return Ok(result);
    }

    /// <summary>
    /// Get feed for a specific user
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
}

