using SocialLibrary.Domain.Entities;
using SocialLibrary.Domain.Enums;

namespace SocialLibrary.Application.Interfaces.Repositories;

public interface IContentRepository : IGenericRepository<Content>
{
    Task<Content?> GetByExternalIdAsync(string externalId, ContentType type);
    Task<IEnumerable<Content>> SearchAsync(string keyword);
}
