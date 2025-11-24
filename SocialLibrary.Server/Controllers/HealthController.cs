using Microsoft.AspNetCore.Mvc;

namespace SocialLibrary.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new { 
            status = "ok", 
            message = "Backend is running",
            timestamp = DateTime.UtcNow 
        });
    }
}

