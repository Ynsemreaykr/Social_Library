using SocialLibrary.Domain.Common;

namespace SocialLibrary.Domain.Entities;

public class ListItem : BaseEntity
{
    public int ListId { get; set; }
    public int ContentId { get; set; }

    public List List { get; set; } = null!;
    public Content Content { get; set; } = null!;
}
