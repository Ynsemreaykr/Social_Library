using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SocialLibrary.Domain.Entities;

namespace SocialLibrary.Infrastructure.Persistence.Configurations;

public class ActivityCommentConfiguration : IEntityTypeConfiguration<ActivityComment>
{
    public void Configure(EntityTypeBuilder<ActivityComment> builder)
    {
        builder.Property(x => x.Text).IsRequired();
    }
}
