namespace SocialLibrary.Application.Interfaces.External;

using SocialLibrary.Application.DTOs.Content;

public interface IExternalMovieService
{
    Task<ContentDetailDto?> FetchMovieMetadataAsync(string externalId);
}
