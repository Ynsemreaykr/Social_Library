# Gmail SMTP Ayarları - Adım Adım Rehber

## 1. Gmail App Password Oluşturma

Gmail normal şifrenizle SMTP kullanamazsınız. **App Password** oluşturmanız gerekiyor.

### Adımlar:

1. **Google Hesabınıza gidin**: https://myaccount.google.com/
2. **Güvenlik** sekmesine tıklayın
3. **2 Adımlı Doğrulama** açık olmalı (yoksa açın)
4. **2 Adımlı Doğrulama** sayfasında aşağı kaydırın
5. **Uygulama şifreleri** bölümünü bulun
6. **Uygulama şifreleri** linkine tıklayın
7. **Uygulama seçin**: "Mail" seçin
8. **Cihaz seçin**: "Diğer (Özel ad)" seçin ve "SocialLibrary" yazın
9. **Oluştur** butonuna tıklayın
10. **16 haneli şifre** göreceksiniz (örnek: `abcd efgh ijkl mnop`) - Bu şifreyi kopyalayın!

## 2. appsettings.json Dosyasını Düzenleme

`SocialLibrary.Server/appsettings.json` dosyasını açın ve şu şekilde düzenleyin:

```json
"Email": {
  "Smtp": {
    "Host": "smtp.gmail.com",
    "Port": "587",
    "Username": "your-email@gmail.com",  // ← Gmail adresinizi yazın
    "Password": "abcd efgh ijkl mnop",   // ← App Password'ü yazın (boşluklar olabilir)
    "FromEmail": "your-email@gmail.com",  // ← Gmail adresinizi yazın
    "FromName": "SocialLibrary",
    "EnableSsl": "true"
  }
}
```

### Örnek:
Eğer Gmail adresiniz `enes107148@gmail.com` ise ve App Password'ünüz `abcd efgh ijkl mnop` ise:

```json
"Email": {
  "Smtp": {
    "Host": "smtp.gmail.com",
    "Port": "587",
    "Username": "enes107148@gmail.com",
    "Password": "abcdefghijklmnop",  // Boşlukları kaldırabilirsiniz
    "FromEmail": "enes107148@gmail.com",
    "FromName": "SocialLibrary",
    "EnableSsl": "true"
  }
}
```

## 3. Test Etme

1. Backend'i yeniden başlatın
2. "Şifremi Unuttum" sayfasına gidin
3. Email adresinizi girin
4. Email'inizi kontrol edin (Gelen Kutusu ve Spam klasörü)

## Sorun Giderme

- **"Invalid credentials" hatası**: App Password'ü yanlış yazmış olabilirsiniz
- **"Connection timeout" hatası**: Firewall veya internet bağlantısı sorunu olabilir
- **Email gelmiyor**: Spam klasörünü kontrol edin

