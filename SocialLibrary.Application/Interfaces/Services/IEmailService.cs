namespace SocialLibrary.Application.Interfaces.Services;

public interface IEmailService
{
    Task SendOneTimePasswordAsync(string email, string password);
}

