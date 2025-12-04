using Microsoft.EntityFrameworkCore;
using SocialLibrary.Application.Interfaces.Repositories;
using SocialLibrary.Domain.Entities;
using SocialLibrary.Infrastructure.Persistence.DbContext;
using SocialLibrary.Infrastructure.Repositories.Base;

namespace SocialLibrary.Infrastructure.Repositories;

public class PasswordResetTokenRepository : GenericRepository<PasswordResetToken>, IPasswordResetTokenRepository
{
    public PasswordResetTokenRepository(SocialLibraryDbContext context) : base(context)
    {
    }

    public async Task<PasswordResetToken?> GetByTokenAsync(string token)
    {
        return await _dbSet
            .Include(x => x.User)
            .FirstOrDefaultAsync(x => x.Token == token);
    }

    public async Task<PasswordResetToken?> GetValidTokenByUserIdAsync(int userId)
    {
        return await _dbSet
            .Include(x => x.User)
            .Where(x => x.UserId == userId 
                && !x.Used 
                && x.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(x => x.CreatedAt)
            .FirstOrDefaultAsync();
    }
}

