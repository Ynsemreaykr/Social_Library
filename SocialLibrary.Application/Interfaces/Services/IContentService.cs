namespace SocialLibrary.Application.Interfaces.Services;

using SocialLibrary.Application.DTOs.Content;

public interface IContentService
{
    Task<ContentDetailDto> GetContentDetailAsync(int contentId);
    Task<IEnumerable<ContentDto>> SearchAsync(string query);
    Task<ContentDetailDto> GetOrCreateContentAsync(string externalId, string type);
}
