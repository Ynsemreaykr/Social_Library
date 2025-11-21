using Microsoft.AspNetCore.Mvc;
using SocialLibrary.Application.DTOs.Auth;
using SocialLibrary.Application.Interfaces.Services;

namespace SocialLibrary.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto dto)
        => Ok(await _authService.RegisterAsync(dto));

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
        => Ok(await _authService.LoginAsync(dto));
}
