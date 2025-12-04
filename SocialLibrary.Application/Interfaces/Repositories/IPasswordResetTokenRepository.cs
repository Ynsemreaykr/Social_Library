using SocialLibrary.Domain.Entities;

namespace SocialLibrary.Application.Interfaces.Repositories;

public interface IPasswordResetTokenRepository : IGenericRepository<PasswordResetToken>
{
    Task<PasswordResetToken?> GetByTokenAsync(string token);
    Task<PasswordResetToken?> GetValidTokenByUserIdAsync(int userId);
}

