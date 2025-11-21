using SocialLibrary.Domain.Common;
using SocialLibrary.Domain.Enums;
using System.Diagnostics;

namespace SocialLibrary.Domain.Entities;

public class Content : BaseEntity
{
    public string ExternalId { get; set; } = null!;
    public ContentType ContentType { get; set; }
    public string Title { get; set; } = null!;
    public int? Year { get; set; }
    public string? PosterUrl { get; set; }
    public string? ExtraJson { get; set; }

    public ICollection<Rating> Ratings { get; set; } = new List<Rating>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<LibraryEntry> LibraryEntries { get; set; } = new List<LibraryEntry>();
    public ICollection<ListItem> ListItems { get; set; } = new List<ListItem>();
    public ICollection<Activity> Activities { get; set; } = new List<Activity>();
}
