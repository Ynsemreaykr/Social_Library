namespace SocialLibrary.Application.DTOs.Content;

public class ContentDetailDto
{
    public int Id { get; set; }
    public string ExternalId { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string? PosterUrl { get; set; }
    public int? Year { get; set; }
    public string? Summary { get; set; }
    public double AverageRating { get; set; }
    public int RatingCount { get; set; }
    public string? ExtraJson { get; set; }
}
