using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialLibrary.Application.DTOs.List;
using SocialLibrary.Application.Interfaces.Repositories;
using SocialLibrary.Application.Interfaces.Services;
using System.Security.Claims;

namespace SocialLibrary.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ListController : ControllerBase
{
    private readonly IListService _listService;
    private readonly IListRepository _listRepository;
    private readonly AutoMapper.IMapper _mapper;

    public ListController(
        IListService listService,
        IListRepository listRepository,
        AutoMapper.IMapper mapper)
    {
        _listService = listService;
        _listRepository = listRepository;
        _mapper = mapper;
    }

    /// <summary>
    /// Get all lists for current user
    /// </summary>
    [HttpGet("me")]
    public async Task<ActionResult<List<ListDto>>> GetMyLists()
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        var lists = await _listRepository.GetUserListsAsync(userId.Value);
        return Ok(_mapper.Map<List<ListDto>>(lists));
    }

    /// <summary>
    /// Get lists for a specific user
    /// </summary>
    [HttpGet("user/{userId:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<List<ListDto>>> GetUserLists(int userId)
    {
        var lists = await _listRepository.GetUserListsAsync(userId);
        return Ok(_mapper.Map<List<ListDto>>(lists));
    }

    /// <summary>
    /// Create a new list
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<int>> CreateList([FromBody] CreateListDto dto)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        try
        {
            var listId = await _listService.CreateListAsync(userId.Value, dto);
            return Ok(new { id = listId, message = "List created successfully." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Add content to a list
    /// </summary>
    [HttpPost("{listId:int}/items")]
    public async Task<IActionResult> AddItem(int listId, [FromBody] AddItemRequestDto dto)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        try
        {
            await _listService.AddToListAsync(listId, dto.ContentId);
            return Ok(new { message = "Item added to list successfully." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Remove content from a list
    /// </summary>
    [HttpDelete("{listId:int}/items/{contentId:int}")]
    public async Task<IActionResult> RemoveItem(int listId, int contentId)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        try
        {
            await _listService.RemoveFromListAsync(listId, contentId);
            return Ok(new { message = "Item removed from list successfully." });
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

public record AddItemRequestDto(int ContentId);

