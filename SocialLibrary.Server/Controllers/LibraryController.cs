using Microsoft.AspNetCore.Mvc;
using SocialLibrary.Application.DTOs.Library;
using SocialLibrary.Application.Interfaces.Services;

namespace SocialLibrary.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LibraryController : ControllerBase
{
    private readonly ILibraryService _service;

    public LibraryController(ILibraryService service)
    {
        _service = service;
    }

    // GET api/Library/user/5
    [HttpGet("user/{userId:int}")]
    public async Task<ActionResult<List<LibraryEntryDto>>> GetUserLibrary(int userId)
    {
        var result = await _service.GetUserLibraryAsync(userId);
        return Ok(result);
    }

    // GET api/Library/10
    [HttpGet("{id:int}")]
    public async Task<ActionResult<LibraryEntryDto>> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        if (result is null)
            return NotFound();

        return Ok(result);
    }

    // POST api/Library
    [HttpPost]
    public async Task<ActionResult<LibraryEntryDto>> Create(CreateLibraryEntryRequestDto dto)
    {
        var created = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    // PUT api/Library/10
    [HttpPut("{id:int}")]
    public async Task<ActionResult<LibraryEntryDto>> Update(int id, UpdateLibraryEntryRequestDto dto)
    {
        var updated = await _service.UpdateAsync(id, dto);
        if (updated is null)
            return NotFound();

        return Ok(updated);
    }

    // DELETE api/Library/10
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}
