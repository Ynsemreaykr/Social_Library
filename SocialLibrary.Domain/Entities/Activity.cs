using SocialLibrary.Domain.Common;
using SocialLibrary.Domain.Enums;

namespace SocialLibrary.Domain.Entities;

public class Activity : BaseEntity
{
    public int UserId { get; set; }
    public ActivityType ActivityType { get; set; }

    public int? ContentId { get; set; }
    public int? RelatedId { get; set; }

    public User User { get; set; } = null!;
    public Content? Content { get; set; }

    public ICollection<ActivityLike> Likes { get; set; } = new List<ActivityLike>();
    public ICollection<ActivityComment> Comments { get; set; } = new List<ActivityComment>();
}
