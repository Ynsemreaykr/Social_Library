using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialLibrary.Application.DTOs.Auth;
using SocialLibrary.Application.Interfaces.Services;
using System;

namespace SocialLibrary.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous] // Auth endpoints herkese açık olmalı
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto dto)
    {
        try
        {
            var result = await _authService.RegisterAsync(dto);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
    {
        try
        {
            var result = await _authService.LoginAsync(dto);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return Unauthorized(new { error = ex.Message });
        }
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestDto? dto)
    {
        try
        {
            Console.WriteLine("========================================");
            Console.WriteLine($"[AuthController] ForgotPassword endpoint çağrıldı");
            Console.WriteLine($"[AuthController] DTO is null: {dto == null}");
            
            if (dto == null)
            {
                Console.WriteLine("[AuthController] ❌ DTO NULL!");
                return BadRequest(new { error = "Request body is required" });
            }
            
            Console.WriteLine($"[AuthController] Email: {dto.Email}");
            Console.WriteLine($"[AuthController] Email is null or empty: {string.IsNullOrEmpty(dto.Email)}");
            Console.WriteLine($"========================================");
            
            if (string.IsNullOrWhiteSpace(dto.Email))
            {
                Console.WriteLine("[AuthController] ❌ Email is null or empty!");
                return BadRequest(new { error = "Email is required" });
            }
            
            await _authService.ForgotPasswordAsync(dto.Email);
            
            Console.WriteLine($"[AuthController] ✅ ForgotPasswordAsync tamamlandı - Email: {dto.Email}");
            // Güvenlik için: Kullanıcı yoksa da başarılı mesajı döndür
            return Ok(new { message = "Eğer bu e-posta adresi sistemde kayıtlıysa, şifre sıfırlama linki gönderildi." });
        }
        catch (Exception ex)
        {
            Console.WriteLine("========================================");
            Console.WriteLine($"[AuthController] ❌ ForgotPassword HATA!");
            Console.WriteLine($"[AuthController] DTO is null: {dto == null}");
            if (dto != null)
            {
                Console.WriteLine($"[AuthController] Email: {dto.Email}");
            }
            Console.WriteLine($"[AuthController] Error: {ex.Message}");
            Console.WriteLine($"[AuthController] Type: {ex.GetType().Name}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"[AuthController] InnerException: {ex.InnerException.Message}");
            }
            Console.WriteLine($"[AuthController] StackTrace: {ex.StackTrace}");
            Console.WriteLine("========================================");
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequestDto dto)
    {
        try
        {
            await _authService.ResetPasswordAsync(dto.Token, dto.NewPassword);
            return Ok(new { message = "Şifreniz başarıyla sıfırlandı." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
