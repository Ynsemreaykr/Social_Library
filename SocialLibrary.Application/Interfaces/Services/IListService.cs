namespace SocialLibrary.Application.Interfaces.Services;

using SocialLibrary.Application.DTOs.List;

public interface IListService
{
    Task<int> CreateListAsync(int userId, CreateListDto dto);
    Task AddToListAsync(int listId, int contentId);
    Task RemoveFromListAsync(int listId, int contentId);
    Task DeleteListAsync(int userId, int listId);
}
