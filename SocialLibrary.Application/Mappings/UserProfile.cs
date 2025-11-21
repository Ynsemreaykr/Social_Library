using AutoMapper;
using SocialLibrary.Application.DTOs.User;
using SocialLibrary.Domain.Entities;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace SocialLibrary.Application.Mappings;

public class UserProfile : Profile
{
    public UserProfile()
    {
        CreateMap<User, UserProfileDto>()
            .ForMember(dest => dest.FollowersCount, opt => opt.MapFrom(src => src.Followers.Count))
            .ForMember(dest => dest.FollowingCount, opt => opt.MapFrom(src => src.Followings.Count));
    }
}
