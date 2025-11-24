using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialLibrary.Application.DTOs.Rating;
using SocialLibrary.Application.Interfaces.Services;
using System.Security.Claims;

namespace SocialLibrary.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RatingController : ControllerBase
{
    private readonly IRatingService _ratingService;

    public RatingController(IRatingService ratingService)
    {
        _ratingService = ratingService;
    }

    /// <summary>
    /// Rate a content (1-10)
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Rate([FromBody] RateContentRequestDto dto)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        try
        {
            await _ratingService.RateAsync(userId.Value, dto.ContentId, dto.Score);
            return Ok(new { message = "Rating saved successfully." });
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
    /// Get current user's rating for a content
    /// </summary>
    [HttpGet("content/{contentId:int}")]
    public async Task<ActionResult<RatingDto>> GetUserRating(int contentId)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        try
        {
            var rating = await _ratingService.GetUserRatingAsync(userId.Value, contentId);
            if (rating == null)
                return NotFound(new { message = "Rating not found." });
            
            return Ok(rating);
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

public record RateContentRequestDto(int ContentId, int Score);

