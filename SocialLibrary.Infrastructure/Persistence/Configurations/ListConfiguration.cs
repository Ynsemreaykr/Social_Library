using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SocialLibrary.Domain.Entities;

namespace SocialLibrary.Infrastructure.Persistence.Configurations;

public class ListConfiguration : IEntityTypeConfiguration<SocialLibrary.Domain.Entities.List>
{
    public void Configure(EntityTypeBuilder<SocialLibrary.Domain.Entities.List> builder)
    {
        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.HasIndex(x => new { x.UserId, x.Name })
            .IsUnique();

        builder.HasOne(x => x.User)
            .WithMany(u => u.Lists)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
