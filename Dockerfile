# Build Aşaması
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Proje dosyalarını kopyala ve restore et
COPY ["SocialLibrary.slnx", "./"]
COPY ["SocialLibrary.Server/SocialLibrary.Server.csproj", "SocialLibrary.Server/"]
COPY ["SocialLibrary.Application/SocialLibrary.Application.csproj", "SocialLibrary.Application/"]
COPY ["SocialLibrary.Domain/SocialLibrary.Domain.csproj", "SocialLibrary.Domain/"]
COPY ["SocialLibrary.Infrastructure/SocialLibrary.Infrastructure.csproj", "SocialLibrary.Infrastructure/"]
RUN dotnet restore "SocialLibrary.Server/SocialLibrary.Server.csproj"

# Tüm kodları kopyala ve derle
COPY . .
WORKDIR "/src/SocialLibrary.Server"
RUN dotnet publish "SocialLibrary.Server.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Çalıştırma Aşaması
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 7860
ENV ASPNETCORE_URLS=http://+:7860
ENTRYPOINT ["dotnet", "SocialLibrary.Server.dll"]
