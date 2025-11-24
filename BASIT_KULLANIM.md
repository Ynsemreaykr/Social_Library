# 🎯 BASIT KULLANIM - Tek Sayfa, Tek Port

## ✅ TEK ADIM

### 1. Backend'i Başlat
```powershell
cd SocialLibrary.Server
dotnet run --launch-profile http
```

### 2. Tarayıcıda Aç
**http://localhost:5162** ← Sadece bu!

## ✅ Yapılan Düzeltmeler

1. ✅ **SpaProxy devre dışı** - Vite dev server artık otomatik başlamıyor
2. ✅ **Otomatik browser açma kapalı** - Hiçbir sayfa otomatik açılmayacak
3. ✅ **Sadece 5162 portu** - Tek sayfa, tek port
4. ✅ **İlk açılışta giriş ekranı** - Token validation ile

## 🚫 Artık Açılmayacak

- ❌ `http://localhost:5173` (Vite dev server)
- ❌ Otomatik açılan sayfalar
- ❌ Birden fazla terminal
- ❌ 2 dakikada bir açılan sayfalar

## ✅ Sadece Bu

- ✅ `http://localhost:5162` - Backend + Frontend (build edilmiş)

## 📝 Frontend Değişikliklerinde

Frontend'de değişiklik yaptıysanız:
```powershell
cd sociallibrary.client
npm run build
```

Sonra backend'i yeniden başlatın.

## 🎉 Test

1. Backend'i başlatın
2. **Manuel olarak** `http://localhost:5162` açın
3. Giriş ekranı gelmeli ✅
4. Giriş yapabilmelisiniz ✅

**BAŞKA BİR ŞEY AÇILMAYACAK!** 🎉

