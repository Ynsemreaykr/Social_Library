# 🔧 Visual Studio'da Tek Sayfa Açılması İçin Çözüm

## 🎯 Sorun
Visual Studio'da "Start" butonuna basıldığında hem frontend (Vite dev server) hem backend başlatılıyor. Bu yüzden iki sayfa açılıyor.

## ✅ Çözüm: Visual Studio Ayarları

### 1. Solution Explorer'da Sağ Tıklayın
- Solution'a (`SocialLibrary`) sağ tıklayın
- **"Set Startup Projects..."** seçin

### 2. Startup Project Ayarlarını Değiştirin
- **"Single startup project"** seçin
- Dropdown'dan **"SocialLibrary.Server"** seçin
- **OK** butonuna tıklayın

### 3. Frontend Projesini Startup'tan Çıkarın
- `sociallibrary.client` projesine sağ tıklayın
- **"Set as Startup Project"** seçeneğinin **işaretli olmadığından** emin olun

## 🚀 Alternatif: Sadece Terminal Kullanın

Visual Studio yerine sadece terminal kullanın:

```powershell
cd C:\Users\ULKU\Desktop\Yazlab2\SocialLibrary\SocialLibrary.Server
dotnet run --launch-profile http
```

Sonra manuel olarak tarayıcıda açın:
**http://localhost:5162**

## ✅ Beklenen Sonuç

- ✅ Tek bir terminal açılacak (backend)
- ✅ Hiçbir sayfa otomatik açılmayacak
- ✅ Vite dev server başlamayacak
- ✅ Sadece backend çalışacak
- ✅ Manuel olarak `http://localhost:5162` açın

## 📝 Not

Frontend'i geliştirirken ayrı bir terminal'de başlatabilirsiniz:
```powershell
cd sociallibrary.client
npm run dev
```

Ama normal kullanımda sadece backend yeterli (frontend build edilmiş halde `wwwroot`'ta).

