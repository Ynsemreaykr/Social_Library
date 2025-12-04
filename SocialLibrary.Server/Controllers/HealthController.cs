using Microsoft.AspNetCore.Mvc;
using SocialLibrary.Application.Interfaces.Services;

namespace SocialLibrary.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly IEmailService _emailService;

    public HealthController(IEmailService emailService)
    {
        _emailService = emailService;
    }

    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new { 
            status = "ok", 
            message = "Backend is running",
            timestamp = DateTime.UtcNow 
        });
    }

    /// <summary>
    /// Test email gönderme endpoint'i (sadece development için)
    /// </summary>
    [HttpPost("test-email")]
    public async Task<IActionResult> TestEmail([FromBody] TestEmailRequestDto dto)
    {
        try
        {
            var testToken = "test-token-12345";
            var testLink = $"http://localhost:5173/reset-password?token={testToken}";
            
            Console.WriteLine($"[HealthController] Test email gönderiliyor - To: {dto.Email}");
            await _emailService.SendPasswordResetEmailAsync(dto.Email, testToken, testLink);
            Console.WriteLine($"[HealthController] Test email gönderildi - To: {dto.Email}");
            
            return Ok(new { message = $"Test email gönderildi: {dto.Email}" });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[HealthController] Test email HATA - To: {dto.Email}, Error: {ex.Message}");
            Console.WriteLine($"[HealthController] StackTrace: {ex.StackTrace}");
            return BadRequest(new { error = ex.Message, details = ex.ToString() });
        }
    }
}

public record TestEmailRequestDto(string Email);

