# 🎯 SocialLibrary - Basit Kullanım Talimatı

## ✅ TEK ADIM: Backend'i Başlat

```powershell
cd SocialLibrary.Server
dotnet run --launch-profile http
```

## 🌐 Tarayıcıda Aç

**http://localhost:5162** ← Sadece bu sayfayı kullanın!

## ✅ Yapılan Düzeltmeler

1. ✅ SpaProxy devre dışı bırakıldı - artık Vite dev server otomatik başlamıyor
2. ✅ Otomatik browser açma kapatıldı
3. ✅ Sadece backend'in serve ettiği sayfa kullanılıyor
4. ✅ İlk açılışta giriş ekranı geliyor
5. ✅ Token validation eklendi

## 📝 Notlar

- **Sadece `http://localhost:5162` kullanın**
- Frontend değişikliklerinde: `cd sociallibrary.client; npm run build`
- Backend başlatıldığında hiçbir sayfa otomatik açılmayacak
- Manuel olarak `http://localhost:5162` adresini açın

## 🚀 Test

1. Backend'i başlatın
2. Tarayıcıda `http://localhost:5162` açın
3. Giriş ekranı gelmeli ✅
4. Giriş yapabilmelisiniz ✅

