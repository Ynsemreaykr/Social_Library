using SocialLibrary.Domain.Common;

namespace SocialLibrary.Domain.Entities;

public class PasswordResetToken : BaseEntity
{
    public int UserId { get; set; }
    public string Token { get; set; } = null!;
    public DateTime ExpiresAt { get; set; }
    public bool Used { get; set; }

    public User User { get; set; } = null!;
}
