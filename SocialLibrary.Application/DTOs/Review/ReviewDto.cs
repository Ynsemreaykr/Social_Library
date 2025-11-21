namespace SocialLibrary.Application.DTOs.Review;

public class ReviewDto
{
    public int UserId { get; set; }
    public int ContentId { get; set; }
    public string Text { get; set; } = null!;
}
