namespace SocialLibrary.Application.Interfaces.Repositories;

public interface IUnitOfWork
{
    IUserRepository Users { get; }
    IContentRepository Contents { get; }
    IRatingRepository Ratings { get; }
    IReviewRepository Reviews { get; }
    ILibraryRepository LibraryEntries { get; }
    IListRepository Lists { get; }
    IListItemRepository ListItems { get; }
    IActivityRepository Activities { get; }
    IActivityLikeRepository ActivityLikes { get; }
    IActivityCommentRepository ActivityComments { get; }

    Task<int> SaveChangesAsync();
}
