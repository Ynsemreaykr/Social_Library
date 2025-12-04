using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialLibrary.Application.DTOs.Review;
using SocialLibrary.Application.Interfaces.Services;
using System.Security.Claims;

namespace SocialLibrary.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewController : ControllerBase
{
    private readonly IReviewService _reviewService;

    public ReviewController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    /// <summary>
    /// Add or update a review for a content
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> AddOrUpdateReview([FromBody] CreateReviewRequestDto dto)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        try
        {
            await _reviewService.AddOrUpdateReviewAsync(userId.Value, dto.ContentId, dto.Text);
            return Ok(new { message = "Review saved successfully." });
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
    /// Delete a review
    /// </summary>
    [HttpDelete("{contentId:int}")]
    public async Task<IActionResult> DeleteReview(int contentId)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        try
        {
            await _reviewService.DeleteReviewAsync(userId.Value, contentId);
            return Ok(new { message = "Review deleted successfully." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Get all reviews for a content
    /// </summary>
    [HttpGet("content/{contentId:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<List<ReviewListItemDto>>> GetContentReviews(int contentId)
    {
        try
        {
            var reviews = await _reviewService.GetContentReviewsAsync(contentId);
            return Ok(reviews);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Get current user's review for a content
    /// </summary>
    [HttpGet("content/{contentId:int}/me")]
    [Authorize]
    public async Task<ActionResult<ReviewDto>> GetUserReview(int contentId)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        try
        {
            var review = await _reviewService.GetUserReviewAsync(userId.Value, contentId);
            // Review yoksa 404 yerine 200 OK ve null döndür
            // Bu, frontend'in console'da 404 hatası görmesini önler
            return Ok(review);
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

public record CreateReviewRequestDto(int ContentId, string Text);

