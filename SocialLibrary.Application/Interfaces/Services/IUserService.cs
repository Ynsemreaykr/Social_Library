namespace SocialLibrary.Application.Interfaces.Services;

using SocialLibrary.Application.DTOs.User;

public interface IUserService
{
    Task<UserProfileDto> GetProfileAsync(string username);
    Task<UserProfileDto> GetProfileByIdAsync(int userId);
    Task FollowAsync(int followerId, int targetUserId);
    Task UnfollowAsync(int followerId, int targetUserId);
    Task UpdateProfileAsync(int userId, UpdateProfileDto dto);
}
