using SocialLibrary.Application.DTOs.Library;

namespace SocialLibrary.Application.Interfaces.Services;

public interface ILibraryService
{
    Task<List<LibraryEntryDto>> GetUserLibraryAsync(int userId);
    Task<LibraryEntryDto?> GetByIdAsync(int id);
    Task<LibraryEntryDto> CreateAsync(CreateLibraryEntryRequestDto dto);
    Task<LibraryEntryDto?> UpdateAsync(int id, UpdateLibraryEntryRequestDto dto);
    Task DeleteAsync(int id);
}
