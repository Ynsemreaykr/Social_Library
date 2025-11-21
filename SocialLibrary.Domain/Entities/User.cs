using SocialLibrary.Domain.Common;
using System.Collections.Generic;
using System.Diagnostics;

namespace SocialLibrary.Domain.Entities;

public class User : BaseEntity
{
    public string Username { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }

    public ICollection<PasswordResetToken> PasswordResetTokens { get; set; } = new List<PasswordResetToken>();
    public ICollection<Follow> Followers { get; set; } = new List<Follow>();
    public ICollection<Follow> Followings { get; set; } = new List<Follow>();
    public ICollection<Rating> Ratings { get; set; } = new List<Rating>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<LibraryEntry> LibraryEntries { get; set; } = new List<LibraryEntry>();
    public ICollection<List> Lists { get; set; } = new List<List>();
    public ICollection<Activity> Activities { get; set; } = new List<Activity>();
    public ICollection<ActivityLike> ActivityLikes { get; set; } = new List<ActivityLike>();
    public ICollection<ActivityComment> ActivityComments { get; set; } = new List<ActivityComment>();
}
