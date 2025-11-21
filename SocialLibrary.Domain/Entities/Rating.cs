using SocialLibrary.Domain.Common;

namespace SocialLibrary.Domain.Entities;

public class Rating : BaseEntity
{
    public int UserId { get; set; }
    public int ContentId { get; set; }
    public int Score { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public Content Content { get; set; } = null!;
}
