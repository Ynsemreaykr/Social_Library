using SocialLibrary.Domain.Common;

namespace SocialLibrary.Domain.Entities;

public class ActivityLike : BaseEntity
{
    public int UserId { get; set; }
    public int ActivityId { get; set; }

    public User User { get; set; } = null!;
    public Activity Activity { get; set; } = null!;
}
