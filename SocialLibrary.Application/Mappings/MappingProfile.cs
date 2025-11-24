using AutoMapper;
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
        CreateMap<LibraryEntry, LibraryEntryDto>();
        CreateMap<CreateLibraryEntryRequestDto, LibraryEntry>();
        CreateMap<UpdateLibraryEntryRequestDto, LibraryEntry>();

        // 🔥 List map'leri
        CreateMap<List, ListDto>();
        CreateMap<CreateListDto, List>();
    }
}
