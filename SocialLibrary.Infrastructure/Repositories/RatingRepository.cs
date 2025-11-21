using Microsoft.EntityFrameworkCore;
using SocialLibrary.Application.Interfaces.Repositories;
using SocialLibrary.Domain.Entities;
using SocialLibrary.Infrastructure.Persistence.DbContext;
using SocialLibrary.Infrastructure.Repositories.Base;

namespace SocialLibrary.Infrastructure.Repositories;

public class RatingRepository : GenericRepository<Rating>, IRatingRepository
{
    public RatingRepository(SocialLibraryDbContext context) : base(context) { }

    public async Task<Rating?> GetUserRatingAsync(int userId, int contentId)
        => await _dbSet.FirstOrDefaultAsync(x => x.UserId == userId && x.ContentId == contentId);
}
