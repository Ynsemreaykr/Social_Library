using AutoMapper;
using SocialLibrary.Application.DTOs.Library;
using SocialLibrary.Application.Interfaces.Repositories;
using SocialLibrary.Application.Interfaces.Services;
using SocialLibrary.Domain.Entities;
using SocialLibrary.Domain.Enums;

namespace SocialLibrary.Infrastructure.Services;

public class LibraryService : ILibraryService
{
    private readonly ILibraryRepository _library;
    private readonly IActivityRepository _activities;
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public LibraryService(
        ILibraryRepository library,
        IActivityRepository activities,
        IUnitOfWork uow,
        IMapper mapper)
    {
        _library = library;
        _activities = activities;
        _uow = uow;
        _mapper = mapper;
    }

    public async Task<List<LibraryEntryDto>> GetUserLibraryAsync(int userId)
    {
        var entries = await _library.GetByUserAsync(userId);
        
        // DEBUG: Library entry'lerini logla
        Console.WriteLine($"[LibraryService] GetUserLibraryAsync - UserId: {userId}, Entry count: {entries.Count()}");
        foreach (var entry in entries)
        {
            Console.WriteLine($"[LibraryService] Entry - Id: {entry.Id}, ContentId: {entry.ContentId}, Status: {entry.Status}, ContentType: {entry.Content?.ContentType} ({(int?)entry.Content?.ContentType})");
        }
        
        return _mapper.Map<List<LibraryEntryDto>>(entries);
    }

    public async Task<LibraryEntryDto?> GetByIdAsync(int id)
    {
        var entity = await _library.GetByIdAsync(id);
        return entity == null ? null : _mapper.Map<LibraryEntryDto>(entity);
    }

    public async Task<LibraryEntryDto> CreateAsync(CreateLibraryEntryRequestDto dto)
    {
        // DEBUG: Library entry oluşturma bilgisini logla
        Console.WriteLine($"[LibraryService] CreateAsync - UserId: {dto.UserId}, ContentId: {dto.ContentId}, Status: {dto.Status}");
        
        // Aynı user + content için bir kayıt varsa güncellemek isteyebilirsin.
        var existing = await _library.GetByUserAndContentAsync(dto.UserId, dto.ContentId);
        if (existing != null)
        {
            Console.WriteLine($"[LibraryService] Existing entry found - Id: {existing.Id}, Status: {existing.Status} -> {dto.Status}");
            existing.Status = dto.Status;
            _library.Update(existing);
            await _uow.SaveChangesAsync();
            return _mapper.Map<LibraryEntryDto>(existing);
        }

        var entity = _mapper.Map<LibraryEntry>(dto);
        Console.WriteLine($"[LibraryService] Creating new LibraryEntry - UserId: {entity.UserId}, ContentId: {entity.ContentId}, Status: {entity.Status}");
        
        await _library.AddAsync(entity);
        await _uow.SaveChangesAsync(); // Save to get entity.Id

        Console.WriteLine($"[LibraryService] LibraryEntry created - Id: {entity.Id}");

        // Create activity for library update
        var activity = new Activity
        {
            UserId = dto.UserId,
            ActivityType = ActivityType.LibraryUpdate,
            ContentId = dto.ContentId,
            RelatedId = entity.Id
        };
        await _activities.AddAsync(activity);
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
