using System.Security.Cryptography;
using System.Text;

namespace SocialLibrary.Infrastructure.Identity;

public static class PasswordHasher
{
    public static string Hash(string password)
    {
        using var sha = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(password);
        var hash = sha.ComputeHash(bytes);
        return Convert.ToHexString(hash); // örn: "A0B1C2..."
    }
}
