using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SocialLibrary.Application.DTOs.User;
using SocialLibrary.Application.Interfaces.Repositories;
using SocialLibrary.Application.Interfaces.Services;
using SocialLibrary.Domain.Entities;

namespace SocialLibrary.Infrastructure.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _users;
    private readonly IGenericRepository<Follow> _follows;
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public UserService(
        IUserRepository users,
        IGenericRepository<Follow> follows,
        IUnitOfWork uow,
        IMapper mapper)
    {
        _users = users;
        _follows = follows;
        _uow = uow;
        _mapper = mapper;
    }

    public async Task<UserProfileDto> GetProfileAsync(string username)
    {
        var user = await _users.GetByUsernameAsync(username);
        if (user == null)
            throw new Exception("User not found.");

        // Get followers and following counts
        var followersCount = await _follows.Query()
            .CountAsync(f => f.FollowingId == user.Id);
        
        var followingCount = await _follows.Query()
            .CountAsync(f => f.FollowerId == user.Id);

        return new UserProfileDto(
            Id: user.Id,
            Username: user.Username,
            AvatarUrl: user.AvatarUrl,
            Bio: user.Bio,
            FollowersCount: followersCount,
            FollowingCount: followingCount
        );
    }

    public async Task<UserProfileDto> GetProfileByIdAsync(int userId)
    {
        var user = await _users.GetByIdAsync(userId);
        if (user == null)
            throw new Exception("User not found.");

        // Get followers and following counts
        var followersCount = await _follows.Query()
            .CountAsync(f => f.FollowingId == user.Id);
        
        var followingCount = await _follows.Query()
            .CountAsync(f => f.FollowerId == user.Id);

        return new UserProfileDto(
            Id: user.Id,
            Username: user.Username,
            AvatarUrl: user.AvatarUrl,
            Bio: user.Bio,
            FollowersCount: followersCount,
            FollowingCount: followingCount
        );
    }

    public async Task FollowAsync(int followerId, int targetUserId)
    {
        if (followerId == targetUserId)
            throw new ArgumentException("Cannot follow yourself.");

        // Check if already following
        var existingFollow = await _follows.Query()
            .FirstOrDefaultAsync(f => f.FollowerId == followerId && f.FollowingId == targetUserId);
        
        if (existingFollow != null)
            return; // Already following

        var follow = new Follow
        {
            FollowerId = followerId,
            FollowingId = targetUserId
        };
        
        await _follows.AddAsync(follow);
        await _uow.SaveChangesAsync();
    }

    public async Task UnfollowAsync(int followerId, int targetUserId)
    {
        var follow = await _follows.Query()
            .FirstOrDefaultAsync(f => f.FollowerId == followerId && f.FollowingId == targetUserId);
        
        if (follow == null)
            return;

        _follows.Delete(follow);
        await _uow.SaveChangesAsync();
    }

    public async Task<bool> IsFollowingAsync(int followerId, int targetUserId)
    {
        var follow = await _follows.Query()
            .FirstOrDefaultAsync(f => f.FollowerId == followerId && f.FollowingId == targetUserId);
        
        return follow != null;
    }

    public async Task<List<UserListItemDto>> GetFollowersAsync(int userId)
    {
        // Get users who follow this user (Followers)
        var followerIds = await _follows.Query()
            .Where(f => f.FollowingId == userId)
            .Select(f => f.FollowerId)
            .ToListAsync();

        if (!followerIds.Any())
            return new List<UserListItemDto>();

        var followers = await _users.Query()
            .Where(u => followerIds.Contains(u.Id))
            .ToListAsync();

        return followers.Select(u => new UserListItemDto(
            Id: u.Id,
            Username: u.Username,
            AvatarUrl: u.AvatarUrl,
            Bio: u.Bio
        )).ToList();
    }

    public async Task<List<UserListItemDto>> GetFollowingAsync(int userId)
    {
        // Get users that this user follows (Following)
        var followingIds = await _follows.Query()
            .Where(f => f.FollowerId == userId)
            .Select(f => f.FollowingId)
            .ToListAsync();

        if (!followingIds.Any())
            return new List<UserListItemDto>();

        var following = await _users.Query()
            .Where(u => followingIds.Contains(u.Id))
            .ToListAsync();

        return following.Select(u => new UserListItemDto(
            Id: u.Id,
            Username: u.Username,
            AvatarUrl: u.AvatarUrl,
            Bio: u.Bio
        )).ToList();
    }

    public async Task UpdateProfileAsync(int userId, UpdateProfileDto dto)
    {
        var user = await _users.GetByIdAsync(userId);
        if (user == null)
            throw new Exception("User not found.");

        if (!string.IsNullOrWhiteSpace(dto.AvatarUrl))
            user.AvatarUrl = dto.AvatarUrl;
        
        if (dto.Bio != null)
            user.Bio = dto.Bio;

        _users.Update(user);
        await _uow.SaveChangesAsync();
    }

    public async Task<List<UserListItemDto>> SearchUsersAsync(string query)
    {
        if (string.IsNullOrWhiteSpace(query))
            return new List<UserListItemDto>();

        var lowercaseQuery = query.ToLower();
        var matchingUsers = await _users.Query()
            .Where(u => u.Username.ToLower().Contains(lowercaseQuery))
            .Take(10)
            .ToListAsync();

        return matchingUsers.Select(u => new UserListItemDto(
            Id: u.Id,
            Username: u.Username,
            AvatarUrl: u.AvatarUrl,
            Bio: u.Bio
        )).ToList();
    }
}

