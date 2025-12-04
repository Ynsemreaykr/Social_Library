using AutoMapper;
using SocialLibrary.Application.DTOs.Feed;
using SocialLibrary.Domain.Entities;

namespace SocialLibrary.Application.Mappings;

public class FeedProfile : Profile
{
    public FeedProfile()
    {
        // Activity → ActivityCardDto mapping
        // Record'lar için ConstructUsing kullan (positional parameters - named parameters desteklenmiyor)
        // Expression tree'de null-conditional operator kullanılamaz, ternary operator kullan
        CreateMap<Activity, ActivityCardDto>()
            .ConstructUsing(src => new ActivityCardDto(
                src.Id, // ActivityId
                src.ActivityType.ToString(), // ActivityType
                src.User != null ? src.User.Username : string.Empty, // Username
                src.User != null ? src.User.AvatarUrl : null, // AvatarUrl
                src.CreatedAt, // CreatedAt
                src.Content != null ? src.Content.Title : null, // ContentTitle
                src.Content != null ? src.Content.PosterUrl : null, // PosterUrl
                null, // Score - Will be enriched later if Rating
                null, // ReviewExcerpt - Will be enriched later if Review
                src.Likes != null ? src.Likes.Count : 0, // LikeCount
                src.Comments != null ? src.Comments.Count : 0 // CommentCount
            ));
    }
}
