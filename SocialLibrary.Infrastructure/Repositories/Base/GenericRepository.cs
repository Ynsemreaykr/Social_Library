using Microsoft.EntityFrameworkCore;
using SocialLibrary.Application.Interfaces.Repositories;
using SocialLibrary.Infrastructure.Persistence.DbContext;
using System.Linq.Expressions;

namespace SocialLibrary.Infrastructure.Repositories.Base;

public class GenericRepository<T> : IGenericRepository<T> where T : class
{
    protected readonly SocialLibraryDbContext _context;
    protected readonly DbSet<T> _dbSet;

    public GenericRepository(SocialLibraryDbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public IQueryable<T> Query()
        => _dbSet.AsQueryable();

    public async Task<T?> GetByIdAsync(int id)
        => await _dbSet.FindAsync(id);

    public async Task<T?> GetAsync(Expression<Func<T, bool>> predicate)
        => await _dbSet.FirstOrDefaultAsync(predicate);

    public async Task<IEnumerable<T>> GetAllAsync(Expression<Func<T, bool>>? predicate = null)
    {
        if (predicate == null)
            return await _dbSet.ToListAsync();

        return await _dbSet.Where(predicate).ToListAsync();
    }

    public async Task AddAsync(T entity)
        => await _dbSet.AddAsync(entity);

    public void Update(T entity)
        => _dbSet.Update(entity);

    public void Delete(T entity)
        => _dbSet.Remove(entity);
}
