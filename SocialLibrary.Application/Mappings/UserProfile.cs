using AutoMapper;
using SocialLibrary.Application.DTOs.Auth;
using SocialLibrary.Application.DTOs.User;
using SocialLibrary.Domain.Entities;

namespace SocialLibrary.Application.Mappings;

public class UserProfile : Profile
{
    public UserProfile()
    {
        // Register formundan User entity oluşturalım
        CreateMap<RegisterRequestDto, User>()
            .ForMember(dest => dest.PasswordHash, opt => opt.Ignore());

        // User → UserProfileDto
        CreateMap<User, UserProfileDto>();
    }
}
