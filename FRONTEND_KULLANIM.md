# 🎯 Frontend Kullanım Kılavuzu

## ⚠️ ÖNEMLİ: Hangi Sayfayı Kullanmalısınız?

### ✅ DOĞRU YOL: Vite Dev Server (http://localhost:5173)

**Development (Geliştirme) sırasında:**
1. Backend'i başlatın: `cd SocialLibrary.Server; dotnet run --launch-profile http`
2. **AYRI bir terminal'de** Frontend'i başlatın: `cd sociallibrary.client; npm run dev`
3. Tarayıcıda **http://localhost:5173** adresini açın
4. Bu sayfa çalışır ve backend'e bağlanır ✅

### ❌ YANLIŞ YOL: Backend'in Serve Ettiği Sayfa (http://localhost:5162)

**Backend başlatıldığında:**
- Backend `http://localhost:5162` adresinde çalışır
- Eğer frontend build edilmemişse, bu sayfa çalışmaz ❌
- Bu sayfa sadece **production** için kullanılır

## 🔧 Neden İki Sayfa Açılıyor?

1. **Backend başlatıldığında:**
   - Backend `http://localhost:5162` adresinde çalışır
   - Eğer `wwwroot` klasöründe build edilmiş frontend varsa, bu sayfayı serve eder
   - Ama development'ta bu sayfa genelde eski/build edilmemiş olur

2. **Vite Dev Server:**
   - `npm run dev` ile başlatılır
   - `http://localhost:5173` adresinde çalışır
   - Hot reload özelliği vardır (kod değişikliklerini anında gösterir)
   - Backend'e bağlanır ✅

## 📝 Adım Adım Kullanım

### Development (Geliştirme) İçin:

1. **Terminal 1 - Backend:**
   ```powershell
   cd SocialLibrary.Server
   dotnet run --launch-profile http
   ```
   - Backend `http://localhost:5162` adresinde çalışır
   - Swagger: `http://localhost:5162/swagger`

2. **Terminal 2 - Frontend:**
   ```powershell
   cd sociallibrary.client
   npm run dev
   ```
   - Frontend `http://localhost:5173` adresinde çalışır
   - **Bu sayfayı kullanın!** ✅

3. **Tarayıcıda:**
   - `http://localhost:5173` adresini açın
   - Giriş yapabilirsiniz ✅

### Production (Yayın) İçin:

1. **Frontend'i build edin:**
   ```powershell
   cd sociallibrary.client
   npm run build
   ```
   - Bu, frontend'i `SocialLibrary.Server/wwwroot` klasörüne build eder

2. **Backend'i başlatın:**
   ```powershell
   cd SocialLibrary.Server
   dotnet run
   ```
   - Artık `http://localhost:5162` adresinde hem backend hem frontend çalışır

## 🐛 Sorun Giderme

### "Backend'e bağlanılamıyor" Hatası

**Eğer `http://localhost:5162` sayfasında bu hatayı alıyorsanız:**
- Bu sayfayı kullanmayın ❌
- `http://localhost:5173` sayfasını kullanın ✅
- Vite dev server'ın çalıştığından emin olun: `npm run dev`

### İki Sayfa Açılıyor

**Normal!** İki farklı frontend çalışıyor:
1. Backend'in serve ettiği (http://localhost:5162) - **Kullanmayın** ❌
2. Vite dev server (http://localhost:5173) - **Bunu kullanın** ✅

### Hangi Sayfayı Kullanmalıyım?

**Development'ta:**
- ✅ `http://localhost:5173` (Vite dev server)
- ❌ `http://localhost:5162` (Backend static files - build edilmemiş olabilir)

**Production'da:**
- ✅ `http://localhost:5162` (Backend + build edilmiş frontend)

## 💡 Özet

- **Development:** `http://localhost:5173` kullanın ✅
- **Production:** `http://localhost:5162` kullanın (önce build edin)
- İki sayfa açılıyorsa, `http://localhost:5173` sayfasını kullanın
- `http://localhost:5162` sayfasında hata alıyorsanız, normal - o sayfayı kullanmayın

