using AutoMapper;
using SocialLibrary.Application.DTOs.Content;
using SocialLibrary.Domain.Entities;

namespace SocialLibrary.Application.Mapping;

public class ContentProfile : Profile
{
    public ContentProfile()
    {
        // Content → ContentDto mapping
        // Record'lar için ConstructUsing kullan (positional parameters)
        CreateMap<Content, ContentDto>()
            .ConstructUsing(src => new ContentDto(
                src.Id,
                src.ExternalId,
                src.ContentType,
                src.Title,
                null, // Description yok, null
                src.PosterUrl, // PosterUrl → CoverUrl
                src.Year
            ));

        CreateMap<CreateContentRequestDto, Content>()
            .ForMember(dest => dest.PosterUrl, opt => opt.MapFrom(src => src.CoverUrl)) // CoverUrl → PosterUrl
            .ForMember(dest => dest.ExternalId, opt => opt.Ignore()) // ExternalId set edilmeyecek
            .ForMember(dest => dest.ContentType, opt => opt.Ignore()); // ContentType set edilmeyecek

        CreateMap<UpdateContentRequestDto, Content>()
            .ForMember(dest => dest.PosterUrl, opt => opt.MapFrom(src => src.CoverUrl)) // CoverUrl → PosterUrl
            .ForAllMembers(opts => opts.Condition(
                (src, dest, srcMember) => srcMember != null));
        // (null gelen alanları overwrite etme)
    }
}
