using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialLibrary.Application.DTOs.Content;
using SocialLibrary.Application.Interfaces.Services;

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

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<ContentDto>> GetById(int id)
    {
        var item = await _contents.GetByIdAsync(id);
        if (item == null)
            return NotFound();

        return Ok(item);
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
