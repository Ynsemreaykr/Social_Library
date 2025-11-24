# Backend Test Talimatları

## Backend'i Başlatma

### Yöntem 1: Visual Studio'dan
1. Visual Studio'yu açın
2. `SocialLibrary.Server` projesini açın
3. Üst menüden **"http"** profilini seçin (veya F5'e basın)
4. Backend `http://localhost:5162` adresinde başlayacak

### Yöntem 2: Terminal'den
```powershell
cd SocialLibrary.Server
dotnet run --launch-profile http
```

## Backend'in Çalıştığını Kontrol Etme

### 1. Health Endpoint Testi
Tarayıcıda şu adresi açın:
```
http://localhost:5162/api/Health
```

**Beklenen Sonuç:**
```json
{
  "status": "ok",
  "message": "Backend is running",
  "timestamp": "2025-11-23T..."
}
```

### 2. Swagger UI Testi
Tarayıcıda şu adresi açın:
```
http://localhost:5162/swagger
```

Swagger UI açılmalı ve tüm API endpoint'lerini görmelisiniz.

### 3. PowerShell ile Test
```powershell
# Health endpoint testi
Invoke-WebRequest -Uri "http://localhost:5162/api/Health" | Select-Object StatusCode, Content

# Login endpoint testi (401 beklenir - normal)
$body = @{
    email = "test@test.com"
    password = "test123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5162/api/Auth/login" -Method POST -ContentType "application/json" -Body $body
```

## Frontend'i Başlatma

### Terminal'den
```powershell
cd sociallibrary.client
npm run dev
```

Frontend `http://localhost:5173` adresinde başlayacak.

## Sorun Giderme

### Backend'e Bağlanılamıyor Hatası

1. **Backend çalışıyor mu?**
   - `http://localhost:5162/api/Health` adresini tarayıcıda açın
   - Eğer açılmıyorsa, backend çalışmıyor demektir

2. **Port çakışması var mı?**
   - Başka bir uygulama 5162 portunu kullanıyor olabilir
   - `netstat -ano | findstr :5162` komutu ile kontrol edin

3. **CORS hatası var mı?**
   - Tarayıcı console'unu açın (F12)
   - Network sekmesinde istekleri kontrol edin
   - CORS hatası görüyorsanız, backend'in CORS ayarlarını kontrol edin

4. **Backend loglarını kontrol edin**
   - Visual Studio Output penceresinde backend loglarını görün
   - Hata mesajları varsa, onları düzeltin

### Backend'i Yeniden Başlatma

Eğer backend çalışmıyorsa veya değişiklikler uygulanmıyorsa:

1. Visual Studio'da backend'i durdurun (Shift+F5)
2. Backend'i tekrar başlatın (F5)
3. Veya terminal'de:
   ```powershell
   # Çalışan backend process'ini bul
   Get-Process | Where-Object {$_.ProcessName -like "*SocialLibrary*"}
   
   # Process'i sonlandır (ID'yi değiştirin)
   Stop-Process -Id <PROCESS_ID> -Force
   
   # Backend'i tekrar başlat
   cd SocialLibrary.Server
   dotnet run --launch-profile http
   ```

## Test Senaryoları

### 1. Kayıt Olma Testi
1. Frontend'i açın: `http://localhost:5173/register`
2. Formu doldurun:
   - Username: `testuser`
   - Email: `test@test.com`
   - Password: `test123`
   - Confirm Password: `test123`
3. "Kayıt Ol" butonuna tıklayın
4. Başarılı olursa ana sayfaya yönlendirilmelisiniz

### 2. Giriş Yapma Testi
1. Frontend'i açın: `http://localhost:5173/login`
2. Formu doldurun:
   - Email: `test@test.com`
   - Password: `test123`
3. "Giriş Yap" butonuna tıklayın
4. Başarılı olursa ana sayfaya yönlendirilmelisiniz

### 3. Browser Console Kontrolü
1. Tarayıcıda F12'ye basın
2. Console sekmesine gidin
3. Network sekmesine gidin
4. Login/Register işlemi yaparken:
   - Request'lerin gönderildiğini görün
   - Response'ların geldiğini görün
   - Hata mesajlarını kontrol edin

## Önemli Notlar

- Backend **MUTLAKA** çalışıyor olmalı
- Backend `http://localhost:5162` adresinde çalışmalı
- Frontend `http://localhost:5173` adresinde çalışmalı
- CORS ayarları development modunda tüm origin'lere izin veriyor
- Browser console'unda detaylı loglar göreceksiniz (axiosClient logging)

