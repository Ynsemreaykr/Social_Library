using SocialLibrary.Domain.Common;
using SocialLibrary.Domain.Enums;

namespace SocialLibrary.Domain.Entities;

public class LibraryEntry : BaseEntity
{
    public int UserId { get; set; }
    public int ContentId { get; set; }
    public EntryType EntryType { get; set; }

    public User User { get; set; } = null!;
    public Content Content { get; set; } = null!;
}
