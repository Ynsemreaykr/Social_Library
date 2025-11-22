using Microsoft.EntityFrameworkCore;
using SocialLibrary.Domain.Entities;

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
        base.OnModelCreating(modelBuilder);

        // ---------------------------------------------------------
        // FOLLOW FIX (çift FK → mutlaka NoAction)
        // ---------------------------------------------------------
        modelBuilder.Entity<Follow>()
            .HasOne(f => f.FollowerUser)
            .WithMany()
            .HasForeignKey(f => f.FollowerId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Follow>()
            .HasOne(f => f.FollowingUser)
            .WithMany()
            .HasForeignKey(f => f.FollowingId)
            .OnDelete(DeleteBehavior.NoAction);

        // ---------------------------------------------------------
        // ACTIVITY FIX — ContentId1 Shadow FK'i yok eder
        // ---------------------------------------------------------
        modelBuilder.Entity<Activity>()
            .HasOne(a => a.Content)
            .WithMany()
            .HasForeignKey(a => a.ContentId)
            .OnDelete(DeleteBehavior.NoAction);

        // ---------------------------------------------------------
        // ACTIVITY LIKE → USER (KESİNLİKLE NO ACTION)
        // ---------------------------------------------------------
        modelBuilder.Entity<ActivityLike>()
            .HasOne(a => a.User)
            .WithMany()
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.NoAction);

        // ---------------------------------------------------------
        // ACTIVITY COMMENT → USER (KESİNLİKLE NO ACTION)
        // ---------------------------------------------------------
        modelBuilder.Entity<ActivityComment>()
            .HasOne(a => a.User)
            .WithMany()
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}
