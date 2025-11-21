namespace SocialLibrary.Application.DTOs.Auth;

public class AuthResponseDto
{
    public string Token { get; set; } = null!;
    public string Username { get; set; } = null!;
    public string Email { get; set; } = null!;
}
