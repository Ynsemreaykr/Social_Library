using AutoMapper;
using SocialLibrary.Application.DTOs.Library;
using SocialLibrary.Application.Interfaces.Repositories;
using SocialLibrary.Application.Interfaces.Services;
using SocialLibrary.Domain.Entities;

namespace SocialLibrary.Infrastructure.Services;

public class LibraryService : ILibraryService
{
    private readonly ILibraryRepository _library;
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public LibraryService(
        ILibraryRepository library,
        IUnitOfWork uow,
        IMapper mapper)
    {
        _library = library;
        _uow = uow;
        _mapper = mapper;
    }

    public async Task<List<LibraryEntryDto>> GetUserLibraryAsync(int userId)
    {
        var entries = await _library.GetByUserAsync(userId);
        return _mapper.Map<List<LibraryEntryDto>>(entries);
    }

    public async Task<LibraryEntryDto?> GetByIdAsync(int id)
    {
        var entity = await _library.GetByIdAsync(id);
        return entity == null ? null : _mapper.Map<LibraryEntryDto>(entity);
    }

    public async Task<LibraryEntryDto> CreateAsync(CreateLibraryEntryRequestDto dto)
    {
        // Aynı user + content için bir kayıt varsa güncellemek isteyebilirsin.
        var existing = await _library.GetByUserAndContentAsync(dto.UserId, dto.ContentId);
        if (existing != null)
        {
            existing.Status = dto.Status;
            _library.Update(existing);
            await _uow.SaveChangesAsync();
            return _mapper.Map<LibraryEntryDto>(existing);
        }

        var entity = _mapper.Map<LibraryEntry>(dto);
        await _library.AddAsync(entity);
        await _uow.SaveChangesAsync();

        return _mapper.Map<LibraryEntryDto>(entity);
    }

    public async Task<LibraryEntryDto?> UpdateAsync(int id, UpdateLibraryEntryRequestDto dto)
    {
        var entity = await _library.GetByIdAsync(id);
        if (entity == null)
            return null;

        _mapper.Map(dto, entity);
        _library.Update(entity);
        await _uow.SaveChangesAsync();

        return _mapper.Map<LibraryEntryDto>(entity);
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await _library.GetByIdAsync(id);
        if (entity == null)
            return;

        _library.Delete(entity);
        await _uow.SaveChangesAsync();
    }
}
