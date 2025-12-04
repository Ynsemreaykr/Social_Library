using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SocialLibrary.Application.DTOs.List;
using SocialLibrary.Application.Interfaces.Repositories;
using SocialLibrary.Application.Interfaces.Services;
using SocialLibrary.Domain.Entities;

namespace SocialLibrary.Infrastructure.Services;

public class ListService : IListService
{
    private readonly IListRepository _lists;
    private readonly IListItemRepository _listItems;
    private readonly IContentRepository _contents;
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public ListService(
        IListRepository lists,
        IListItemRepository listItems,
        IContentRepository contents,
        IUnitOfWork uow,
        IMapper mapper)
    {
        _lists = lists;
        _listItems = listItems;
        _contents = contents;
        _uow = uow;
        _mapper = mapper;
    }

    public async Task<int> CreateListAsync(int userId, CreateListDto dto)
    {
        // Aynı isimde liste var mı kontrol et
        var existingList = await _lists.Query()
            .FirstOrDefaultAsync(l => l.UserId == userId && l.Name.ToLower() == dto.Name.ToLower());
        
        if (existingList != null)
        {
            throw new Exception("Bu isimde bir listeniz zaten var. Lütfen farklı bir isim seçin.");
        }
        
        var list = new List
        {
            UserId = userId,
            Name = dto.Name.Trim(),
            Description = dto.Description
        };
        
        await _lists.AddAsync(list);
        await _uow.SaveChangesAsync();
        
        return list.Id;
    }

    public async Task AddToListAsync(int listId, int contentId)
    {
        // Check if list exists and belongs to user
        var list = await _lists.GetByIdAsync(listId);
        if (list == null)
            throw new Exception("List not found.");

        // Check if content exists
        var content = await _contents.GetByIdAsync(contentId);
        if (content == null)
            throw new Exception("Content not found.");

        // Check if item already in list
        var existingItem = await _listItems.Query()
            .FirstOrDefaultAsync(x => x.ListId == listId && x.ContentId == contentId);
        
        if (existingItem != null)
            return; // Already in list

        var listItem = new ListItem
        {
            ListId = listId,
            ContentId = contentId
        };
        
        await _listItems.AddAsync(listItem);
        await _uow.SaveChangesAsync();
    }

    public async Task RemoveFromListAsync(int listId, int contentId)
    {
        var listItem = await _listItems.Query()
            .FirstOrDefaultAsync(x => x.ListId == listId && x.ContentId == contentId);
        
        if (listItem == null)
            return;

        _listItems.Delete(listItem);
        await _uow.SaveChangesAsync();
    }

    public async Task DeleteListAsync(int userId, int listId)
    {
        var list = await _lists.GetByIdAsync(listId);
        if (list == null)
            throw new Exception("List not found.");

        // Liste kullanıcıya ait mi kontrol et
        if (list.UserId != userId)
            throw new UnauthorizedAccessException("Bu listeyi silme yetkiniz yok.");

        // Liste silindiğinde ListItems otomatik silinir (Cascade Delete)
        _lists.Delete(list);
        await _uow.SaveChangesAsync();
    }
}

