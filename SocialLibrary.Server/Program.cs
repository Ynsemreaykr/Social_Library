using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SocialLibrary.Application.Interfaces.Repositories;
using SocialLibrary.Application.Interfaces.Services;
using SocialLibrary.Infrastructure.Identity;
using SocialLibrary.Infrastructure.Persistence.DbContext;
using SocialLibrary.Infrastructure.Repositories;
using SocialLibrary.Infrastructure.Repositories.UnitOfWork;
using SocialLibrary.Infrastructure.Services;
using SocialLibrary.Application.Interfaces.Services;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// DbContext
builder.Services.AddDbContext<SocialLibraryDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        b => b.MigrationsAssembly("SocialLibrary.Server")
    ));

// AutoMapper
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

// Auth
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddSingleton<JwtTokenGenerator>();

// Content Service
builder.Services.AddScoped<IContentService, ContentService>();
builder.Services.AddScoped<ILibraryService, LibraryService>();

// Feed Service
builder.Services.AddScoped<IFeedService, FeedService>();

// JWT
var jwtSection = builder.Configuration.GetSection("Jwt");
var key = jwtSection["Key"] ?? throw new Exception("Jwt:Key missing");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,
            ValidIssuer = jwtSection["Issuer"],
            ValidAudience = jwtSection["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key))
        };
    });

// ---------------------------------------------------------
// 🔥 BÜTÜN REPOSITORY DI KAYITLARI — En kritik kısım
// ---------------------------------------------------------

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IContentRepository, ContentRepository>();
builder.Services.AddScoped<IRatingRepository, RatingRepository>();
builder.Services.AddScoped<IReviewRepository, ReviewRepository>();
builder.Services.AddScoped<ILibraryRepository, LibraryRepository>();
builder.Services.AddScoped<IListRepository, ListRepository>();
builder.Services.AddScoped<IListItemRepository, ListItemRepository>();
builder.Services.AddScoped<IActivityRepository, ActivityRepository>();
builder.Services.AddScoped<IActivityLikeRepository, ActivityLikeRepository>();
builder.Services.AddScoped<IActivityCommentRepository, ActivityCommentRepository>();

// Unit of Work
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// ---------------------------------------------------------

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapFallbackToFile("/index.html");

// Development modunda hem React app hem Swagger'ı aç
if (app.Environment.IsDevelopment())
{
    // Uygulama başladığında browser'ları aç
    var lifetime = app.Services.GetRequiredService<Microsoft.Extensions.Hosting.IHostApplicationLifetime>();
    
    lifetime.ApplicationStarted.Register(() =>
    {
        Task.Run(async () =>
        {
            // Uygulamanın tamamen başlaması için kısa bir bekleme
            await Task.Delay(1500);
            
            try
            {
                // Base URL'yi configuration'dan al veya varsayılan kullan
                var baseUrl = "https://localhost:7105"; // Default HTTPS URL
                
                // React uygulamasını aç (ana sayfa)
                System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo
                {
                    FileName = baseUrl,
                    UseShellExecute = true
                });
                
                // Swagger'ı aç (500ms sonra)
                await Task.Delay(500);
                System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo
                {
                    FileName = $"{baseUrl}/swagger",
                    UseShellExecute = true
                });
                
                Console.WriteLine($"✓ React app açıldı: {baseUrl}");
                Console.WriteLine($"✓ Swagger açıldı: {baseUrl}/swagger");
            }
            catch (Exception ex)
            {
                // Hata olsa bile uygulama çalışmaya devam etsin
                Console.WriteLine($"⚠ Browser açılırken hata: {ex.Message}");
            }
        });
    });
}

app.Run();
