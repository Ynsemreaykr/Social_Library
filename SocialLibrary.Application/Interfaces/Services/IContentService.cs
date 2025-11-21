using SocialLibrary.Application.DTOs.Content;

namespace SocialLibrary.Application.Interfaces.Services;

public interface IContentService
{
    Task<List<ContentDto>> GetAllAsync();
    Task<ContentDto?> GetByIdAsync(int id);
    Task<ContentDto> CreateAsync(CreateContentRequestDto dto);
    Task<ContentDto?> UpdateAsync(int id, UpdateContentRequestDto dto);
    Task DeleteAsync(int id);
}
