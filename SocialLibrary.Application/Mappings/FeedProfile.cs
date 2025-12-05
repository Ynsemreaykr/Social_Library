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
            .ConstructUsing(src => new ActivityCardDto(
                src.Id,
                src.ActivityType.ToString(),
                src.UserId,
                src.User.Username,
                src.User.AvatarUrl,
                src.CreatedAt,
                src.ContentId,
                src.Content != null ? src.Content.Title : null,
                src.Content != null ? src.Content.PosterUrl : null,
                src.Content != null ? src.Content.ContentType.ToString() : null,
                src.Content != null ? src.Content.ExternalId : null,
                null, // Score - Will be set later if Rating activity
                null, // ReviewExcerpt - Will be set later if Review activity
                src.Likes != null ? src.Likes.Count : 0,
                src.Comments != null ? src.Comments.Count : 0
            ));
    }
}
