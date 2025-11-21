using AutoMapper;
using SocialLibrary.Application.DTOs.Feed;
using SocialLibrary.Domain.Entities;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace SocialLibrary.Application.Mappings;

public class FeedProfile : Profile
{
    public FeedProfile()
    {
        CreateMap<Activity, ActivityCardDto>()
            .ForMember(dest => dest.ActivityId, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.ActivityType, opt => opt.MapFrom(src => src.ActivityType.ToString()))
            .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.User.Username))
            .ForMember(dest => dest.AvatarUrl, opt => opt.MapFrom(src => src.User.AvatarUrl))
            .ForMember(dest => dest.ContentTitle, opt => opt.MapFrom(src => src.Content!.Title))
            .ForMember(dest => dest.PosterUrl, opt => opt.MapFrom(src => src.Content!.PosterUrl));
    }
}
