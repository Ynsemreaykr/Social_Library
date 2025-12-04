# Gmail App Password Nasıl Oluşturulur? (Adım Adım)

## ⚠️ ÖNEMLİ: Gmail normal şifrenizle SMTP çalışmaz!

Gmail, güvenlik nedeniyle normal şifrenizle SMTP kullanımına izin vermez. **App Password** (Uygulama Şifresi) oluşturmanız gerekiyor.

---

## 📋 Adım Adım Rehber

### 1️⃣ 2 Adımlı Doğrulamayı Açın (Eğer açık değilse)

1. https://myaccount.google.com/ adresine gidin
2. Sol menüden **"Güvenlik"** sekmesine tıklayın
3. **"2 Adımlı Doğrulama"** bölümünü bulun
4. Eğer kapalıysa, açın ve telefon numaranızı doğrulayın

### 2️⃣ App Password Oluşturun

1. **"Güvenlik"** sayfasında aşağı kaydırın
2. **"2 Adımlı Doğrulama"** bölümünde **"Uygulama şifreleri"** linkine tıklayın
   - Veya direkt: https://myaccount.google.com/apppasswords
3. **"Uygulama seçin"** dropdown'ından **"Mail"** seçin
4. **"Cihaz seçin"** dropdown'ından **"Diğer (Özel ad)"** seçin
5. Açılan kutucuğa **"SocialLibrary"** yazın
6. **"Oluştur"** butonuna tıklayın
7. **16 haneli şifre** göreceksiniz (örnek: `abcd efgh ijkl mnop`)

### 3️⃣ Şifreyi Kopyalayın

- Şifre şu formatta olacak: `abcd efgh ijkl mnop` (4'erli gruplar halinde)
- **Boşlukları kaldırabilirsiniz**: `abcdefghijklmnop`
- Bu şifreyi kopyalayın (bir daha gösterilmeyecek!)

### 4️⃣ appsettings.json'a Yapıştırın

`SocialLibrary.Server/appsettings.json` dosyasını açın ve şu satırı güncelleyin:

```json
"Password": "abcdefghijklmnop"  // ← App Password'ü buraya yapıştırın (boşluklar olmadan)
```

**Örnek:**
- Gmail: `enes107148@gmail.com`
- App Password: `abcd efgh ijkl mnop` → `abcdefghijklmnop`

```json
"Username": "enes107148@gmail.com",
"Password": "abcdefghijklmnop",  // ← Normal şifre DEĞİL, App Password!
"FromEmail": "enes107148@gmail.com",
```

### 5️⃣ Backend'i Yeniden Başlatın

Değişikliklerin uygulanması için backend'i durdurup tekrar başlatın.

### 6️⃣ Test Edin

"Şifremi Unuttum" sayfasından email gönderin ve Gmail'inizi kontrol edin.

---

## ❌ Yaygın Hatalar

### "5.7.0 Authentication Required" hatası
- **Sebep**: Normal şifre kullanıyorsunuz
- **Çözüm**: App Password oluşturun (yukarıdaki adımları takip edin)

### "2 Adımlı Doğrulama açık değil" hatası
- **Sebep**: 2FA kapalı
- **Çözüm**: Önce 2 Adımlı Doğrulamayı açın, sonra App Password oluşturun

### "Invalid credentials" hatası
- **Sebep**: App Password'ü yanlış yazmış olabilirsiniz
- **Çözüm**: Boşlukları kaldırdığınızdan emin olun, tekrar kopyalayın

---

## 💡 İpucu

Eğer App Password oluşturamıyorsanız veya test etmek istiyorsanız:
- `appsettings.json`'da `Password` alanını boş bırakın
- Email console'a yazdırılacak (development için yeterli)

