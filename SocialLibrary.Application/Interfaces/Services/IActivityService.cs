namespace SocialLibrary.Application.Interfaces.Services;

public interface IActivityService
{
    Task AddActivityAsync(int userId, string type, int? contentId, int? relatedId);
}
