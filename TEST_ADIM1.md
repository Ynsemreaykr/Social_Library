# ✅ ADIM 1 Test Senaryosu

## 🎯 Test: Kayıt Formu (Bio + AvatarUrl)

### 1. Backend'i Başlat
```powershell
cd C:\Users\ULKU\Desktop\Yazlab2\SocialLibrary\SocialLibrary.Server
dotnet run --launch-profile http
```

### 2. Tarayıcıda Aç
- Otomatik olarak `http://localhost:5162/login` açılacak ✅

### 3. Kayıt Formunu Test Et
1. **Kayıt Ol** butonuna tıklayın
2. Formu doldurun:
   - Kullanıcı Adı: `testuser`
   - E-posta: `test@example.com`
   - Şifre: `123456`
   - Şifre Tekrar: `123456`
   - **Biyografi**: `Test kullanıcısı biyografisi` (opsiyonel)
   - **Profil Fotoğrafı URL**: `https://via.placeholder.com/150` (opsiyonel)
3. **Kayıt Ol** butonuna tıklayın

### 4. Backend'de Kontrol Et
SQL Server'da `Users` tablosunda:
```sql
SELECT Username, Email, Bio, AvatarUrl FROM Users WHERE Username = 'testuser'
```
- `Bio` ve `AvatarUrl` alanlarının kaydedildiğini kontrol edin ✅

### 5. Sonuç
- ✅ Bio ve AvatarUrl alanları formda görünüyor
- ✅ Form gönderildiğinde backend'e kaydediliyor
- ✅ SQL'de Bio ve AvatarUrl kaydedilmiş

---

## 🚀 Sonraki Adım: ADIM 2
Rating/Review verilerini backend'den çekme

