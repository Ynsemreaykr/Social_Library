using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialLibrary.Application.DTOs.User;
using SocialLibrary.Application.Interfaces.Services;
using System.Security.Claims;

namespace SocialLibrary.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService;
    }

    /// <summary>
    /// Get user profile by username
    /// </summary>
    [HttpGet("profile/{username}")]
    [AllowAnonymous]
    public async Task<ActionResult<UserProfileDto>> GetProfile(string username)
    {
        try
        {
            var profile = await _userService.GetProfileAsync(username);
            return Ok(profile);
        }
        catch (Exception ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Get user profile by userId
    /// </summary>
    [HttpGet("{userId:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<UserProfileDto>> GetProfileById(int userId)
    {
        try
        {
            var profile = await _userService.GetProfileByIdAsync(userId);
            return Ok(profile);
        }
        catch (Exception ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Get current user's profile
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserProfileDto>> GetMyProfile()
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        // TODO: Get username from token or add GetProfileByIdAsync method
        // For now, this is a placeholder
        return BadRequest(new { error = "Not implemented yet. Use /api/User/profile/{username}" });
    }

    /// <summary>
    /// Update current user's profile
    /// </summary>
    [HttpPut("me")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        try
        {
            await _userService.UpdateProfileAsync(userId.Value, dto);
            return Ok(new { message = "Profile updated successfully." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Follow a user
    /// </summary>
    [HttpPost("{targetUserId:int}/follow")]
    [Authorize]
    public async Task<IActionResult> Follow(int targetUserId)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        try
        {
            await _userService.FollowAsync(userId.Value, targetUserId);
            return Ok(new { message = "User followed successfully." });
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
    /// Unfollow a user
    /// </summary>
    [HttpDelete("{targetUserId:int}/follow")]
    [Authorize]
    public async Task<IActionResult> Unfollow(int targetUserId)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        try
        {
            await _userService.UnfollowAsync(userId.Value, targetUserId);
            return Ok(new { message = "User unfollowed successfully." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Check if current user is following a user
    /// </summary>
    [HttpGet("{targetUserId:int}/follow/status")]
    [Authorize]
    public async Task<ActionResult<bool>> GetFollowStatus(int targetUserId)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        try
        {
            var isFollowing = await _userService.IsFollowingAsync(userId.Value, targetUserId);
            return Ok(isFollowing);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Get followers list for a user
    /// </summary>
    [HttpGet("{userId:int}/followers")]
    [AllowAnonymous]
    public async Task<ActionResult<List<UserListItemDto>>> GetFollowers(int userId)
    {
        try
        {
            var followers = await _userService.GetFollowersAsync(userId);
            return Ok(followers);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Get following list for a user
    /// </summary>
    [HttpGet("{userId:int}/following")]
    [AllowAnonymous]
    public async Task<ActionResult<List<UserListItemDto>>> GetFollowing(int userId)
    {
        try
        {
            var following = await _userService.GetFollowingAsync(userId);
            return Ok(following);
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

