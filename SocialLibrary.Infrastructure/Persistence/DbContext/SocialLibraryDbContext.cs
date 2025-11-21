using Microsoft.EntityFrameworkCore;
using SocialLibrary.Domain.Entities;
using System.Collections.Generic;
using System.Reflection.Emit;

namespace SocialLibrary.Infrastructure.Persistence.DbContext;

public class SocialLibraryDbContext : Microsoft.EntityFrameworkCore.DbContext
{
    public SocialLibraryDbContext(DbContextOptions<SocialLibraryDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();
    public DbSet<Follow> Follows => Set<Follow>();
    public DbSet<Content> Contents => Set<Content>();
    public DbSet<Rating> Ratings => Set<Rating>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<LibraryEntry> LibraryEntries => Set<LibraryEntry>();
    public DbSet<Domain.Entities.List> Lists => Set<Domain.Entities.List>();
    public DbSet<ListItem> ListItems => Set<ListItem>();
    public DbSet<Activity> Activities => Set<Activity>();
    public DbSet<ActivityLike> ActivityLikes => Set<ActivityLike>();
    public DbSet<ActivityComment> ActivityComments => Set<ActivityComment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(SocialLibraryDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
