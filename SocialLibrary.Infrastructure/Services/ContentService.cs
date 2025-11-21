using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SocialLibrary.Application.DTOs.Content;
using SocialLibrary.Application.Interfaces.Repositories;
using SocialLibrary.Application.Interfaces.Services;
using SocialLibrary.Domain.Entities;

namespace SocialLibrary.Infrastructure.Services;

public class ContentService : IContentService
{
    private readonly IContentRepository _contents;
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public ContentService(
        IContentRepository contents,
        IUnitOfWork uow,
        IMapper mapper)
    {
        _contents = contents;
        _uow = uow;
        _mapper = mapper;
    }

    public async Task<List<ContentDto>> GetAllAsync()
    {
        var list = await _contents
            .Query()                 // GenericRepository’de varsa
            .OrderBy(x => x.Id)
            .ToListAsync();

        return _mapper.Map<List<ContentDto>>(list);
    }

    public async Task<ContentDto?> GetByIdAsync(int id)
    {
        var entity = await _contents.GetByIdAsync(id);
        return entity == null ? null : _mapper.Map<ContentDto>(entity);
    }

    public async Task<ContentDto> CreateAsync(CreateContentRequestDto dto)
    {
        var entity = _mapper.Map<Content>(dto);

        await _contents.AddAsync(entity);
        await _uow.SaveChangesAsync();

        return _mapper.Map<ContentDto>(entity);
    }

    public async Task<ContentDto?> UpdateAsync(int id, UpdateContentRequestDto dto)
    {
        var entity = await _contents.GetByIdAsync(id);
        if (entity == null)
            return null;

        _mapper.Map(dto, entity);     // sadece dolu gelen alanları günceller
        _contents.Update(entity);
        await _uow.SaveChangesAsync();

        return _mapper.Map<ContentDto>(entity);
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await _contents.GetByIdAsync(id);
        if (entity == null)
            return;

        _contents.Delete(entity);
        await _uow.SaveChangesAsync();
    }
}
