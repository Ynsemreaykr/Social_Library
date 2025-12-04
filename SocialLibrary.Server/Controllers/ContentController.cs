using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialLibrary.Application.DTOs.Content;
using SocialLibrary.Application.Interfaces.Services;
using SocialLibrary.Domain.Enums;

namespace SocialLibrary.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContentController : ControllerBase
{
    private readonly IContentService _contents;

    public ContentController(IContentService contents)
    {
        _contents = contents;
    }

    // Herkese açık liste
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<List<ContentDto>>> GetAll()
    {
        var list = await _contents.GetAllAsync();
        return Ok(list);
    }

    /// <summary>
    /// Search and filter content
    /// </summary>
    [HttpGet("search")]
    [AllowAnonymous]
    public async Task<ActionResult<List<ContentDto>>> Search(
        [FromQuery] string? query,
        [FromQuery] string? contentType,
        [FromQuery] int? minYear,
        [FromQuery] int? maxYear,
        [FromQuery] int? minRating)
    {
        var results = await _contents.SearchAsync(query, contentType, minYear, maxYear, minRating);
        return Ok(results);
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<ContentDto>> GetById(int id)
    {
        var item = await _contents.GetByIdAsync(id);
        if (item == null)
            return NotFound();

        return Ok(item);
    }

    /// <summary>
    /// Get content detail with platform rating and review count
    /// </summary>
    [HttpGet("{id:int}/detail")]
    [AllowAnonymous]
    public async Task<ActionResult<ContentDetailDto>> GetDetail(int id)
    {
        var detail = await _contents.GetDetailAsync(id);
        if (detail == null)
            return NotFound();

        return Ok(detail);
    }

    /// <summary>
    /// Get or create content by external ID (TMDb or Google Books ID)
    /// </summary>
    [HttpPost("external")]
    [Authorize]
    public async Task<ActionResult<ContentDto>> GetOrCreateByExternalId([FromBody] GetOrCreateContentRequestDto dto)
    {
        try
        {
            // ContentType kontrolü - case insensitive ve daha sağlam
            ContentType contentType;
            var contentTypeLower = dto.ContentType?.ToLower().Trim();
            if (contentTypeLower == "movie" || contentTypeLower == "1")
            {
                contentType = ContentType.Movie;
            }
            else if (contentTypeLower == "book" || contentTypeLower == "2")
            {
                contentType = ContentType.Book;
            }
            else
            {
                // Varsayılan olarak Movie (eski kod uyumluluğu için)
                contentType = ContentType.Movie;
            }
            
            // DEBUG: ContentType bilgisini logla
            Console.WriteLine($"[ContentController] GetOrCreateByExternalId - ExternalId: {dto.ExternalId}, ContentType: {dto.ContentType} -> {contentType}");
            
            var content = await _contents.GetOrCreateByExternalIdAsync(
                dto.ExternalId,
                contentType,
                dto.Title,
                dto.Year,
                dto.PosterUrl,
                dto.ExtraJson
            );
            
            // DEBUG: Oluşturulan/bulunan Content bilgisini logla
            Console.WriteLine($"[ContentController] Content created/found - Id: {content.Id}, ExternalId: {content.ExternalId}, ContentType: {content.ContentType}");
            
            return Ok(content);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ContentController] Error in GetOrCreateByExternalId: {ex.Message}");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // Sadece login olanlar içerik ekleyebilsin
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<ContentDto>> Create(
        [FromBody] CreateContentRequestDto dto)
    {
        var created = await _contents.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    [Authorize]
    public async Task<ActionResult<ContentDto>> Update(
        int id,
        [FromBody] UpdateContentRequestDto dto)
    {
        var updated = await _contents.UpdateAsync(id, dto);
        if (updated == null)
            return NotFound();

        return Ok(updated);
    }

    [HttpDelete("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        await _contents.DeleteAsync(id);
        return NoContent();
    }
}

public record GetOrCreateContentRequestDto(
    string ExternalId,
    string ContentType,
    string Title,
    int? Year = null,
    string? PosterUrl = null,
    string? ExtraJson = null
);
