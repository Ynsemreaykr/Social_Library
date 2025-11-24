# 🚀 Hızlı Başlangıç - SocialLibrary

## ✅ Doğru Kullanım (Development)

### 1. Backend'i Başlat
```powershell
cd SocialLibrary.Server
dotnet run --launch-profile http
```
✅ Backend `http://localhost:5162` adresinde çalışır

### 2. Frontend'i Başlat (YENİ TERMİNAL)
```powershell
cd sociallibrary.client
npm run dev
```
✅ Frontend `http://localhost:5173` adresinde çalışır

### 3. Tarayıcıda Aç
**http://localhost:5173** ← Bu sayfayı kullanın! ✅

## ❌ Hangi Sayfayı Kullanmamalısınız?

- ❌ **http://localhost:5162** - Backend'in serve ettiği sayfa (build edilmemiş olabilir)
- ✅ **http://localhost:5173** - Vite dev server (çalışıyor)

## 🔍 Nasıl Anlarsınız?

Browser console'da (F12) hangi URL'den geldiğinizi görebilirsiniz:
- ✅ `http://localhost:5173` → Doğru sayfa
- ❌ `http://localhost:5162` → Yanlış sayfa (kullanmayın)

## 💡 Özet

- **Backend:** `http://localhost:5162` (API için)
- **Frontend:** `http://localhost:5173` (Kullanıcı arayüzü için) ← **Bunu kullanın!**

