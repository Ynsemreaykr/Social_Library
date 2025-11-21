using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SocialLibrary.Domain.Entities;

namespace SocialLibrary.Infrastructure.Persistence.Configurations;

public class ActivityLikeConfiguration : IEntityTypeConfiguration<ActivityLike>
{
    public void Configure(EntityTypeBuilder<ActivityLike> builder)
    {
        builder.HasIndex(x => new { x.UserId, x.ActivityId })
            .IsUnique();
    }
}
