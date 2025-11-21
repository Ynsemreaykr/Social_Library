namespace SocialLibrary.Application.DTOs.User;

public class UserProfileDto
{
    public string Username { get; set; } = null!;
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
    public int FollowersCount { get; set; }
    public int FollowingCount { get; set; }
}
