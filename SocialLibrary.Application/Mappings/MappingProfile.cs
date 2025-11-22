using AutoMapper;
using SocialLibrary.Application.DTOs.Content;
using SocialLibrary.Application.DTOs.Library;
using SocialLibrary.Application.DTOs.Auth;
using SocialLibrary.Domain.Entities;

namespace SocialLibrary.Application.Mapping;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Auth vs. zaten vardır

        // Content map'lerin
        CreateMap<Content, ContentDto>().ReverseMap();
        CreateMap<CreateContentRequestDto, Content>();
        CreateMap<UpdateContentRequestDto, Content>();

        // 🔥 Library map'leri
        CreateMap<LibraryEntry, LibraryEntryDto>();
        CreateMap<CreateLibraryEntryRequestDto, LibraryEntry>();
        CreateMap<UpdateLibraryEntryRequestDto, LibraryEntry>();
    }
}
