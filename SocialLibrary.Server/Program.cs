using Microsoft.EntityFrameworkCore;
using SocialLibrary.Infrastructure.Persistence.DbContext;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// 🔥 DbContext buraya eklenir
builder.Services.AddDbContext<SocialLibraryDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        b => b.MigrationsAssembly("SocialLibrary.Server")
    )
);


builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();
app.MapFallbackToFile("/index.html");

app.Run();
