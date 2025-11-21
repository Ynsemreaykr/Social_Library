using SocialLibrary.Domain.Common;

namespace SocialLibrary.Domain.Entities;

public class Follow : BaseEntity
{
    public int FollowerId { get; set; }
    public int FollowingId { get; set; }

    public User FollowerUser { get; set; } = null!;
    public User FollowingUser { get; set; } = null!;
}
