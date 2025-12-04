using SocialLibrary.Application.Interfaces.Repositories;
using SocialLibrary.Infrastructure.Persistence.DbContext;

namespace SocialLibrary.Infrastructure.Repositories.UnitOfWork
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly SocialLibraryDbContext _context;

        public UnitOfWork(
            SocialLibraryDbContext context,
            IUserRepository users,
            IContentRepository contents,
            IRatingRepository ratings,
            IReviewRepository reviews,
            ILibraryRepository libraryEntries,
            IListRepository lists,
            IListItemRepository listItems,
            IActivityRepository activities,
            IActivityLikeRepository activityLikes,
            IActivityCommentRepository activityComments,
            IPasswordResetTokenRepository passwordResetTokens)
        {
            _context = context;
            Users = users;
            Contents = contents;
            Ratings = ratings;
            Reviews = reviews;
            LibraryEntries = libraryEntries;
            Lists = lists;
            ListItems = listItems;
            Activities = activities;
            ActivityLikes = activityLikes;
            ActivityComments = activityComments;
            PasswordResetTokens = passwordResetTokens;
        }

        public IUserRepository Users { get; }
        public IContentRepository Contents { get; }
        public IRatingRepository Ratings { get; }
        public IReviewRepository Reviews { get; }
        public ILibraryRepository LibraryEntries { get; }
        public IListRepository Lists { get; }
        public IListItemRepository ListItems { get; }
        public IActivityRepository Activities { get; }
        public IActivityLikeRepository ActivityLikes { get; }
        public IActivityCommentRepository ActivityComments { get; }
        public IPasswordResetTokenRepository PasswordResetTokens { get; }

        public Task<int> SaveChangesAsync()
            => _context.SaveChangesAsync();
    }
}
