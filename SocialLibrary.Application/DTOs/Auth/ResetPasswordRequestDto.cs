namespace SocialLibrary.Application.DTOs.Auth;

public record ResetPasswordRequestDto(string Token, string NewPassword);

