namespace SocialLibrary.Application.Interfaces.Services;

public interface IEmailService
{
    Task SendPasswordResetEmailAsync(string email, string resetToken, string resetLink);
}

