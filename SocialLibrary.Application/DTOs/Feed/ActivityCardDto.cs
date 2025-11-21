namespace SocialLibrary.Application.DTOs.Feed;

public class ActivityCardDto
{
    public int ActivityId { get; set; }
    public string ActivityType { get; set; } = null!;
    public string Username { get; set; } = null!;
    public string? AvatarUrl { get; set; }
    public DateTime CreatedAt { get; set; }

    public string? ContentTitle { get; set; }
    public string? PosterUrl { get; set; }
    public int? Score { get; set; }
    public string? ReviewExcerpt { get; set; }

    public int LikeCount { get; set; }
    public int CommentCount { get; set; }
}
