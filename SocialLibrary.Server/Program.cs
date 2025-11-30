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
using System.Linq;
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

// Email Service
builder.Services.AddScoped<IEmailService, EmailService>();

// Content Service
builder.Services.AddScoped<IContentService, ContentService>();
builder.Services.AddScoped<ILibraryService, LibraryService>();

// Feed Service
builder.Services.AddScoped<IFeedService, FeedService>();

// Rating, Review, List, User, Activity Services
builder.Services.AddScoped<IRatingService, RatingService>();
builder.Services.AddScoped<IReviewService, ReviewService>();
builder.Services.AddScoped<IListService, ListService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IActivityService, ActivityService>();

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

// Generic Repository for Follow entity
builder.Services.AddScoped(typeof(IGenericRepository<SocialLibrary.Domain.Entities.Follow>), 
    typeof(SocialLibrary.Infrastructure.Repositories.Base.GenericRepository<SocialLibrary.Domain.Entities.Follow>));

// Unit of Work
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// ---------------------------------------------------------

// CORS Policy - Frontend'den gelen isteklere izin ver
builder.Services.AddCors(options =>
{
    // Development için daha geniş CORS (sadece development'ta)
    // Not: AllowAnyOrigin() ile AllowCredentials() birlikte kullanılamaz
    if (builder.Environment.IsDevelopment())
    {
        options.AddPolicy("AllowAll", policy =>
        {
            policy.AllowAnyOrigin()  // Tüm origin'lere izin ver
                  .AllowAnyMethod()
                  .AllowAnyHeader();
            // AllowCredentials() kullanmıyoruz çünkü AllowAnyOrigin() ile uyumsuz
            // JWT token zaten Authorization header'da gönderiliyor, sorun yok
        });
    }
    
    // Default policy - spesifik origin'ler için (production için)
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(
                "https://localhost:7105",  // Backend'in kendi domain'i
                "http://localhost:7105",
                "http://localhost:5162",   // Backend HTTP portu
                "https://localhost:5173",  // Vite dev server HTTPS
                "http://localhost:5173"    // Vite dev server HTTP
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials(); // Cookie'ler için (JWT header'da gönderiliyor, gerekli değil ama zarar vermez)
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "SocialLibrary.Server",
        Version = "v1"
    });

    // JWT Bearer auth ekliyoruz
    var securityScheme = new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "JWT Authorization header. Örn: Bearer {token}"
    };

    c.AddSecurityDefinition("Bearer", securityScheme);

    var securityRequirement = new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    };

    c.AddSecurityRequirement(securityRequirement);
});


var app = builder.Build();

// CORS - En başta, diğer middleware'lerden ÖNCE olmalı
if (app.Environment.IsDevelopment())
{
    app.UseCors("AllowAll"); // Development'ta daha geniş CORS
}
else
{
    app.UseCors(); // Production'da default policy
}

// Static files - Her zaman kullan (hem development hem production)
app.UseDefaultFiles();
app.UseStaticFiles();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// HTTPS redirection - Sadece production'da veya HTTPS isteklerinde
// Development'ta HTTP isteklerini de kabul etmeliyiz
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// SPA fallback - index.html'i serve et
app.MapFallbackToFile("/index.html");

// Development modunda hem React app hem Swagger'ı aç ve URL bilgilerini göster
var lifetime = app.Services.GetRequiredService<Microsoft.Extensions.Hosting.IHostApplicationLifetime>();
lifetime.ApplicationStarted.Register(() =>
{
    // Backend URL bilgilerini console'a yazdır
    Console.WriteLine("\n========================================");
    Console.WriteLine("🚀 Backend başarıyla başlatıldı!");
    Console.WriteLine("========================================");
    var urls = app.Urls;
    if (urls.Any())
    {
        foreach (var url in urls)
        {
            Console.WriteLine($"📍 Backend URL: {url}");
            Console.WriteLine($"   - API Base: {url}/api");
            Console.WriteLine($"   - Health: {url}/api/Health");
            Console.WriteLine($"   - Swagger: {url}/swagger");
        }
    }
    else
    {
        // launchSettings'den port bilgisi
        var httpPort = builder.Configuration["Kestrel:Endpoints:Http:Url"]?.Replace("http://", "").Replace("localhost:", "") ?? "5162";
        var httpsPort = "7105";
        Console.WriteLine($"📍 Backend muhtemelen şu portlarda çalışıyor:");
        Console.WriteLine($"   - HTTP: http://localhost:{httpPort}");
        Console.WriteLine($"   - HTTPS: https://localhost:{httpsPort}");
        Console.WriteLine($"   - API Base: http://localhost:{httpPort}/api");
        Console.WriteLine($"   - Health: http://localhost:{httpPort}/api/Health");
        Console.WriteLine($"   - Swagger: http://localhost:{httpPort}/swagger");
    }
    Console.WriteLine("========================================\n");

    // Development modunda tarayıcıyı otomatik aç - Login sayfasına yönlendir
    if (app.Environment.IsDevelopment())
    {
        var url = urls.FirstOrDefault() ?? "http://localhost:5162";
        var loginUrl = $"{url}/login";
        try
        {
            System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo
            {
                FileName = loginUrl,
                UseShellExecute = true
            });
            Console.WriteLine($"🌐 Tarayıcı açıldı: {loginUrl}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"⚠️ Tarayıcı açılamadı: {ex.Message}");
            Console.WriteLine($"📍 Manuel olarak şu adresi açın: {loginUrl}");
        }
    }
});

app.Run();
