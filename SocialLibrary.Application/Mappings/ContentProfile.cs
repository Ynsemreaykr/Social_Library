using AutoMapper;
using SocialLibrary.Application.DTOs.Content;
using SocialLibrary.Domain.Entities;

namespace SocialLibrary.Application.Mapping;

public class ContentProfile : Profile
{
    public ContentProfile()
    {
        CreateMap<Content, ContentDto>();

        CreateMap<CreateContentRequestDto, Content>();

        CreateMap<UpdateContentRequestDto, Content>()
            .ForAllMembers(opts => opts.Condition(
                (src, dest, srcMember) => srcMember != null));
        // (null gelen alanları overwrite etme)
    }
}
