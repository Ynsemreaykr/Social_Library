using Microsoft.EntityFrameworkCore;
using SocialLibrary.Application.Interfaces.Repositories;
using SocialLibrary.Domain.Entities;
using SocialLibrary.Infrastructure.Persistence.DbContext;
using SocialLibrary.Infrastructure.Repositories.Base;

namespace SocialLibrary.Infrastructure.Repositories;

public class ListRepository : GenericRepository<SocialLibrary.Domain.Entities.List>, IListRepository
{
    public ListRepository(SocialLibraryDbContext context) : base(context) { }

    public async Task<IEnumerable<SocialLibrary.Domain.Entities.List>> GetUserListsAsync(int userId)
        => await _dbSet.Where(x => x.UserId == userId).ToListAsync();
}
