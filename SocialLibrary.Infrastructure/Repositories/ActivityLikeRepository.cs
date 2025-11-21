using SocialLibrary.Application.Interfaces.Repositories;
using SocialLibrary.Domain.Entities;
using SocialLibrary.Infrastructure.Persistence.DbContext;
using SocialLibrary.Infrastructure.Repositories.Base;

namespace SocialLibrary.Infrastructure.Repositories;

public class ActivityLikeRepository : GenericRepository<ActivityLike>, IActivityLikeRepository
{
    public ActivityLikeRepository(SocialLibraryDbContext context) : base(context) { }
}
