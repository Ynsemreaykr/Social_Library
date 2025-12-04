using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SocialLibrary.Application.DTOs.Content;
using SocialLibrary.Application.Interfaces.Repositories;
using SocialLibrary.Application.Interfaces.Services;
using SocialLibrary.Domain.Entities;
using SocialLibrary.Domain.Enums;
using System.Text.Json;

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

    public async Task<ContentDetailDto?> GetDetailAsync(int id)
    {
        var entity = await _contents.Query()
            .Include(x => x.Ratings)
            .Include(x => x.Reviews)
            .FirstOrDefaultAsync(x => x.Id == id);
        
        if (entity == null)
            return null;

        // Calculate average rating
        var averageRating = entity.Ratings.Any() 
            ? entity.Ratings.Average(r => r.Score) 
            : 0.0;
        
        var ratingCount = entity.Ratings.Count;

        // Parse ExtraJson to get summary/description
        string? summary = null;
        if (!string.IsNullOrEmpty(entity.ExtraJson))
        {
            try
            {
                var json = System.Text.Json.JsonDocument.Parse(entity.ExtraJson);
                summary = json.RootElement.TryGetProperty("overview", out var overview) 
                    ? overview.GetString() 
                    : json.RootElement.TryGetProperty("description", out var desc) 
                        ? desc.GetString() 
                        : null;
            }
            catch
            {
                // If JSON parsing fails, ignore
            }
        }

        return new ContentDetailDto(
            Id: entity.Id,
            ExternalId: entity.ExternalId,
            Title: entity.Title,
            PosterUrl: entity.PosterUrl,
            Year: entity.Year,
            Summary: summary,
            AverageRating: averageRating,
            RatingCount: ratingCount,
            ExtraJson: entity.ExtraJson
        );
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

    public async Task<List<ContentDto>> SearchAsync(string? query, string? contentType, int? minYear, int? maxYear, int? minRating)
    {
        var queryable = _contents.Query();

        // Search by title
        if (!string.IsNullOrWhiteSpace(query))
        {
            queryable = queryable.Where(x => x.Title.Contains(query));
        }

        // Filter by content type
        if (!string.IsNullOrWhiteSpace(contentType) && Enum.TryParse<ContentType>(contentType, true, out var type))
        {
            queryable = queryable.Where(x => x.ContentType == type);
        }

        // Filter by year range
        if (minYear.HasValue)
        {
            queryable = queryable.Where(x => x.Year >= minYear.Value);
        }
        if (maxYear.HasValue)
        {
            queryable = queryable.Where(x => x.Year <= maxYear.Value);
        }

        // Filter by minimum rating (average rating)
        if (minRating.HasValue)
        {
            queryable = queryable
                .Where(x => x.Ratings.Any() && 
                    x.Ratings.Average(r => r.Score) >= minRating.Value);
        }

        var results = await queryable
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return _mapper.Map<List<ContentDto>>(results);
    }

    public async Task<ContentDto> GetOrCreateByExternalIdAsync(string externalId, ContentType contentType, string title, int? year = null, string? posterUrl = null, string? extraJson = null)
    {
        // DEBUG: Gelen parametreleri logla
        Console.WriteLine($"[ContentService] GetOrCreateByExternalIdAsync - ExternalId: {externalId}, ContentType: {contentType} ({(int)contentType}), Title: {title}");
        
        // Check if content already exists - SADECE AYNI ContentType ile kontrol et
        var existing = await _contents.GetByExternalIdAsync(externalId, contentType);
        if (existing != null)
        {
            Console.WriteLine($"[ContentService] Content found - Id: {existing.Id}, ExternalId: {existing.ExternalId}, ContentType: {existing.ContentType} ({(int)existing.ContentType})");
            return _mapper.Map<ContentDto>(existing);
        }

        // Create new content
        var entity = new Content
        {
            ExternalId = externalId,
            ContentType = contentType, // ContentType'ı doğru kaydet
            Title = title,
            Year = year,
            PosterUrl = posterUrl,
            ExtraJson = extraJson
        };

        Console.WriteLine($"[ContentService] Creating new Content - ExternalId: {entity.ExternalId}, ContentType: {entity.ContentType} ({(int)entity.ContentType})");

        await _contents.AddAsync(entity);
        await _uow.SaveChangesAsync();

        Console.WriteLine($"[ContentService] Content created - Id: {entity.Id}, ExternalId: {entity.ExternalId}, ContentType: {entity.ContentType} ({(int)entity.ContentType})");

        return _mapper.Map<ContentDto>(entity);
    }
}
