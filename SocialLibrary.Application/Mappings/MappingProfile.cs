using AutoMapper;
using System.Linq;
using SocialLibrary.Application.DTOs.Content;
using SocialLibrary.Application.DTOs.Library;
using SocialLibrary.Application.DTOs.List;
using SocialLibrary.Application.DTOs.Auth;
using SocialLibrary.Domain.Entities;

namespace SocialLibrary.Application.Mapping;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Auth vs. zaten vardır

        // Content map'leri ContentProfile'da tanımlı, burada tekrar tanımlamaya gerek yok
        // (ContentProfile daha detaylı mapping içeriyor)

        // 🔥 Library map'leri
        // Record'lar için ConstructUsing kullan (positional parameters)
        CreateMap<LibraryEntry, LibraryEntryDto>()
            .ConstructUsing(src => new LibraryEntryDto(
                src.Id,
                src.UserId,
                src.ContentId,
                src.Status,
                src.CreatedAt,
                src.Content != null ? new ContentDto(
                    src.Content.Id,
                    src.Content.ExternalId,
                    src.Content.ContentType,
                    src.Content.Title,
                    null, // Description yok
                    src.Content.PosterUrl, // PosterUrl → CoverUrl
                    src.Content.Year
                ) : null
            ));
        CreateMap<CreateLibraryEntryRequestDto, LibraryEntry>();
        CreateMap<UpdateLibraryEntryRequestDto, LibraryEntry>();

        // 🔥 List map'leri - Record'lar için manuel mapping
        // AutoMapper record'lar için ConstructUsing gerektirir, ancak kompleks LINQ sorguları sorun çıkarabilir
        // Bu yüzden ListController'da manuel mapping yapacağız
        CreateMap<CreateListDto, List>();
    }
}
