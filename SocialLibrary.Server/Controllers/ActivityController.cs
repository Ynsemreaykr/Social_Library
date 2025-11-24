using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialLibrary.Application.DTOs.Feed;
using SocialLibrary.Application.Interfaces.Services;
using System.Security.Claims;

namespace SocialLibrary.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ActivityController : ControllerBase
{
    private readonly IActivityService _activityService;

    public ActivityController(IActivityService activityService)
    {
        _activityService = activityService;
    }

    /// <summary>
    /// Like an activity
    /// </summary>
    [HttpPost("{activityId:int}/like")]
    [Authorize]
    public async Task<IActionResult> LikeActivity(int activityId)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        try
        {
            await _activityService.LikeActivityAsync(userId.Value, activityId);
            return Ok(new { message = "Activity liked successfully." });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Unlike an activity
    /// </summary>
    [HttpDelete("{activityId:int}/like")]
    [Authorize]
    public async Task<IActionResult> UnlikeActivity(int activityId)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        try
        {
            await _activityService.UnlikeActivityAsync(userId.Value, activityId);
            return Ok(new { message = "Activity unliked successfully." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Check if current user liked an activity
    /// </summary>
    [HttpGet("{activityId:int}/like/me")]
    [Authorize]
    public async Task<ActionResult<bool>> IsLiked(int activityId)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        try
        {
            var isLiked = await _activityService.IsLikedAsync(userId.Value, activityId);
            return Ok(isLiked);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Comment on an activity
    /// </summary>
    [HttpPost("{activityId:int}/comment")]
    [Authorize]
    public async Task<IActionResult> CommentActivity(int activityId, [FromBody] CreateActivityCommentDto dto)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        try
        {
            await _activityService.CommentActivityAsync(userId.Value, activityId, dto.Text);
            return Ok(new { message = "Comment added successfully." });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Get comments for an activity
    /// </summary>
    [HttpGet("{activityId:int}/comments")]
    [AllowAnonymous]
    public async Task<ActionResult<List<ActivityCommentDto>>> GetActivityComments(int activityId)
    {
        try
        {
            var comments = await _activityService.GetActivityCommentsAsync(activityId);
            return Ok(comments);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Get likes for an activity
    /// </summary>
    [HttpGet("{activityId:int}/likes")]
    [AllowAnonymous]
    public async Task<ActionResult<List<ActivityLikeDto>>> GetActivityLikes(int activityId)
    {
        try
        {
            var likes = await _activityService.GetActivityLikesAsync(activityId);
            return Ok(likes);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Get like count for an activity
    /// </summary>
    [HttpGet("{activityId:int}/likes/count")]
    [AllowAnonymous]
    public async Task<ActionResult<int>> GetLikeCount(int activityId)
    {
        try
        {
            var count = await _activityService.GetLikeCountAsync(activityId);
            return Ok(count);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
            ?? User.FindFirst("sub")?.Value;
        
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            return null;
        
        return userId;
    }
}

