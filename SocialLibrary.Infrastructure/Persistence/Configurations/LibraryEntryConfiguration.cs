using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SocialLibrary.Domain.Entities;
using SocialLibrary.Domain.Enums;

namespace SocialLibrary.Infrastructure.Persistence.Configurations;

public class LibraryEntryConfiguration : IEntityTypeConfiguration<LibraryEntry>
{
    public void Configure(EntityTypeBuilder<LibraryEntry> builder)
    {
        builder.HasIndex(x => new { x.UserId, x.ContentId })
            .IsUnique();

        builder.Property(x => x.EntryType)
            .HasConversion<string>()
            .IsRequired();
    }
}
