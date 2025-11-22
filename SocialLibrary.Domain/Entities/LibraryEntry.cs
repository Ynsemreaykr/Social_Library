using SocialLibrary.Domain.Common;
using SocialLibrary.Domain.Enums;

namespace SocialLibrary.Domain.Entities;

public class LibraryEntry : BaseEntity
{
    public int UserId { get; set; }
    public int ContentId { get; set; }

    // 🔥 Asıl eksik olan kısım:
    public EntryType EntryType { get; set; }   // Watched, ToWatch, Read, ToRead
    public LibraryStatus Status { get; set; }  // Completed, InProgress, Dropped vb.

    // Navigation
    public User User { get; set; } = null!;
    public Content Content { get; set; } = null!;
}
