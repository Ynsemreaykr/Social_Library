using Microsoft.EntityFrameworkCore;
using SocialLibrary.Application.Interfaces.Repositories;
using SocialLibrary.Domain.Entities;
using SocialLibrary.Domain.Enums;
using SocialLibrary.Infrastructure.Persistence.DbContext;
using SocialLibrary.Infrastructure.Repositories.Base;

namespace SocialLibrary.Infrastructure.Repositories;

public class ContentRepository : GenericRepository<Content>, IContentRepository
{
    public ContentRepository(SocialLibraryDbContext context) : base(context) { }

    public new async Task<Content?> GetByIdAsync(int id)
        => await _dbSet.FirstOrDefaultAsync(x => x.Id == id);

    public async Task<Content?> GetByExternalIdAsync(string externalId, ContentType type)
        => await _dbSet.FirstOrDefaultAsync(x => x.ExternalId == externalId && x.ContentType == type);

    public new async Task AddAsync(Content content)
        => await base.AddAsync(content);

    public async Task<IEnumerable<Content>> SearchAsync(string keyword)
        => await _dbSet
            .Where(x => x.Title.Contains(keyword))
            .Take(20)
            .ToListAsync();
}
