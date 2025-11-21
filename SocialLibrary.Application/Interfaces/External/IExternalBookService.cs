namespace SocialLibrary.Application.Interfaces.External;

using SocialLibrary.Application.DTOs.Content;

public interface IExternalBookService
{
    Task<ContentDetailDto?> FetchBookMetadataAsync(string externalId);
}
