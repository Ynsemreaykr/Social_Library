using Microsoft.EntityFrameworkCore;
using SocialLibrary.Application.Interfaces.Repositories;
using SocialLibrary.Domain.Entities;
using SocialLibrary.Infrastructure.Persistence.DbContext;
using SocialLibrary.Infrastructure.Repositories.Base;

namespace SocialLibrary.Infrastructure.Repositories;

public class ReviewRepository : GenericRepository<Review>, IReviewRepository
{
    public ReviewRepository(SocialLibraryDbContext context) : base(context) { }

    public async Task<Review?> GetUserReviewAsync(int userId, int contentId)
        => await _dbSet.FirstOrDefaultAsync(x => x.UserId == userId && x.ContentId == contentId);
}
