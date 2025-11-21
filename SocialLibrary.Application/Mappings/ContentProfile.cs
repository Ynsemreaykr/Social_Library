using AutoMapper;
using SocialLibrary.Application.DTOs.Content;
using SocialLibrary.Domain.Entities;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace SocialLibrary.Application.Mappings;

public class ContentProfile : Profile
{
    public ContentProfile()
    {
        CreateMap<Content, ContentDto>();
        CreateMap<Content, ContentDetailDto>()
            .ForMember(dest => dest.AverageRating, opt => opt.Ignore())
            .ForMember(dest => dest.RatingCount, opt => opt.Ignore());
    }
}
