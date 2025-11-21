using SocialLibrary.Application.Interfaces.Repositories;
using SocialLibrary.Domain.Entities;
using SocialLibrary.Infrastructure.Persistence.DbContext;
using SocialLibrary.Infrastructure.Repositories.Base;

namespace SocialLibrary.Infrastructure.Repositories;

public class ListItemRepository : GenericRepository<ListItem>, IListItemRepository
{
    public ListItemRepository(SocialLibraryDbContext context) : base(context) { }
}
