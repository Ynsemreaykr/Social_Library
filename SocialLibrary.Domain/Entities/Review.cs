using SocialLibrary.Domain.Common;

namespace SocialLibrary.Domain.Entities;

public class Review : BaseEntity
{
    public int UserId { get; set; }
    public int ContentId { get; set; }
    public string Text { get; set; } = null!;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public Content Content { get; set; } = null!;
}
