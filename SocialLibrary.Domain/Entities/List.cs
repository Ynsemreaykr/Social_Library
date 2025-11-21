using SocialLibrary.Domain.Common;

namespace SocialLibrary.Domain.Entities;

public class List : BaseEntity
{
    public int UserId { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }

    public User User { get; set; } = null!;
    public ICollection<ListItem> Items { get; set; } = new List<ListItem>();
}
