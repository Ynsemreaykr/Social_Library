using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SocialLibrary.Domain.Entities;

namespace SocialLibrary.Infrastructure.Persistence.Configurations;

public class RatingConfiguration : IEntityTypeConfiguration<Rating>
{
    public void Configure(EntityTypeBuilder<Rating> builder)
    {
        builder.Property(x => x.Score)
            .IsRequired();

        builder.HasIndex(x => new { x.UserId, x.ContentId })
            .IsUnique();

        builder.HasOne(x => x.User)
            .WithMany(u => u.Ratings)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Content)
            .WithMany(c => c.Ratings)
            .HasForeignKey(x => x.ContentId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
