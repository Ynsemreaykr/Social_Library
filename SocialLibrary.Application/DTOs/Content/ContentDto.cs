namespace SocialLibrary.Application.DTOs.Content;

public class ContentDto
{
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public string? PosterUrl { get; set; }
    public int? Year { get; set; }
}
