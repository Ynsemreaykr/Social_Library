using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SocialLibrary.Domain.Entities;
using SocialLibrary.Domain.Enums;

namespace SocialLibrary.Infrastructure.Persistence.Configurations;

public class ContentConfiguration : IEntityTypeConfiguration<Content>
{
    public void Configure(EntityTypeBuilder<Content> builder)
    {
        builder.Property(x => x.Title)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(x => x.ExternalId)
            .IsRequired()
            .HasMaxLength(100);

        builder.HasIndex(x => new { x.ExternalId, x.ContentType })
            .IsUnique();

        builder.Property(x => x.ContentType)
            .HasConversion<string>()
            .IsRequired();
    }
}
