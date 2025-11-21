using SocialLibrary.Domain.Common;

namespace SocialLibrary.Domain.Entities;

public class ActivityComment : BaseEntity
{
    public int UserId { get; set; }
    public int ActivityId { get; set; }
    public string Text { get; set; } = null!;

    public User User { get; set; } = null!;
    public Activity Activity { get; set; } = null!;
}
