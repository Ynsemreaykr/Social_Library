using SocialLibrary.Application.DTOs.Content;
using SocialLibrary.Domain.Enums;

namespace SocialLibrary.Application.Interfaces.Services;

public interface IContentService
{
    Task<List<ContentDto>> GetAllAsync();
    Task<ContentDto?> GetByIdAsync(int id);
    Task<ContentDetailDto?> GetDetailAsync(int id);
    Task<ContentDto> CreateAsync(CreateContentRequestDto dto);
    Task<ContentDto?> UpdateAsync(int id, UpdateContentRequestDto dto);
    Task DeleteAsync(int id);
    Task<List<ContentDto>> SearchAsync(string? query, string? contentType, int? minYear, int? maxYear, int? minRating);
    Task<ContentDto> GetOrCreateByExternalIdAsync(string externalId, ContentType contentType, string title, int? year = null, string? posterUrl = null, string? extraJson = null);
}
