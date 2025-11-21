namespace SocialLibrary.Application.DTOs.Feed;

public class ActivityCommentDto
{
    public string Username { get; set; } = null!;
    public string Text { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
}
