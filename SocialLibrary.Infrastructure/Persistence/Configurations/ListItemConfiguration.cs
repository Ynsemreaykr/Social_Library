using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SocialLibrary.Domain.Entities;

namespace SocialLibrary.Infrastructure.Persistence.Configurations;

public class ListItemConfiguration : IEntityTypeConfiguration<ListItem>
{
    public void Configure(EntityTypeBuilder<ListItem> builder)
    {
        builder.HasIndex(x => new { x.ListId, x.ContentId })
            .IsUnique();
    }
}
