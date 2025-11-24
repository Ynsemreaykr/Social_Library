# 🗺️ SocialLibrary Projesi - Yol Haritası

## 📊 Mevcut Durum Analizi

### ✅ Çalışan Özellikler
- **Kayıt/Giriş**: Backend'e bağlı, SQL'e kaydediyor ✅
- **Rating/Review**: Backend'e bağlı, Activity oluşturuluyor ✅
- **Library**: Backend'e bağlı (kısmen) ✅
- **Lists**: Backend'e bağlı (kısmen) ✅

### ❌ Eksikler ve Sorunlar

1. **Kayıt Formu**: Bio ve AvatarUrl alanları eksik
2. **Rating/Review**: Kullanıcı verileri cache'den alınıyor, backend'den çekilmiyor
3. **Activity Like/Comment**: Backend'de tablolar var ama endpoint'ler yok
4. **Library Activity**: Library işlemlerinde Activity oluşturulmuyor
5. **Feed**: Activity'ler gösterilmiyor, Like/Comment butonları yok
6. **Content Bilgileri**: Library ve List'lerde Content bilgileri eksik/kategorize edilmemiş

---

## 🎯 Adım Adım Yol Haritası

### **ADIM 1: Kayıt Formunu Geliştir** ⏱️ ~15 dk
**Hedef**: Bio ve AvatarUrl alanlarını ekle

**Yapılacaklar**:
- [ ] `RegisterForm.jsx`'e bio ve avatarUrl input'ları ekle
- [ ] `RegisterRequestDto`'ya bio ve avatarUrl ekle (backend)
- [ ] `AuthService.RegisterAsync`'i güncelle
- [ ] Frontend'de form validation ekle

**Dosyalar**:
- `sociallibrary.client/src/features/auth/components/RegisterForm.jsx`
- `SocialLibrary.Application/DTOs/Auth/RegisterRequestDto.cs`
- `SocialLibrary.Infrastructure/Services/AuthService.cs`

---

### **ADIM 2: Rating/Review - Backend'den Veri Çekme** ⏱️ ~30 dk
**Hedef**: Kullanıcının verdiği puanları ve yorumları backend'den çek

**Yapılacaklar**:
- [ ] `RatingController`'a `GetUserRating` endpoint'i ekle
- [ ] `ReviewController`'a `GetUserReview` endpoint'i ekle
- [ ] `useRatings.js`'de cache yerine backend'den çek
- [ ] `ContentDetailPage`'de kullanıcı verilerini backend'den yükle

**Dosyalar**:
- `SocialLibrary.Server/Controllers/RatingController.cs`
- `SocialLibrary.Server/Controllers/ReviewController.cs`
- `SocialLibrary.Application/Interfaces/Services/IRatingService.cs`
- `SocialLibrary.Application/Interfaces/Services/IReviewService.cs`
- `sociallibrary.client/src/features/ratings/hooks/useRatings.js`
- `sociallibrary.client/src/api/ratingApi.js`
- `sociallibrary.client/src/api/reviewApi.js`

---

### **ADIM 3: Activity Like/Comment Endpoint'leri** ⏱️ ~45 dk
**Hedef**: Activity'leri beğenme ve yorumlama endpoint'leri

**Yapılacaklar**:
- [ ] `ActivityController` oluştur
- [ ] `LikeActivity` endpoint'i ekle (POST `/api/Activity/{activityId}/like`)
- [ ] `UnlikeActivity` endpoint'i ekle (DELETE `/api/Activity/{activityId}/like`)
- [ ] `CommentActivity` endpoint'i ekle (POST `/api/Activity/{activityId}/comment`)
- [ ] `GetActivityComments` endpoint'i ekle (GET `/api/Activity/{activityId}/comments`)
- [ ] `GetActivityLikes` endpoint'i ekle (GET `/api/Activity/{activityId}/likes`)
- [ ] Service layer'da `IActivityService` oluştur
- [ ] Frontend'de `activityApi.js` oluştur

**Dosyalar**:
- `SocialLibrary.Server/Controllers/ActivityController.cs` (YENİ)
- `SocialLibrary.Application/Interfaces/Services/IActivityService.cs` (YENİ)
- `SocialLibrary.Infrastructure/Services/ActivityService.cs` (YENİ)
- `sociallibrary.client/src/api/activityApi.js` (YENİ)

---

### **ADIM 4: Library Activity Oluşturma** ⏱️ ~20 dk
**Hedef**: Library işlemlerinde Activity oluştur

**Yapılacaklar**:
- [ ] `LibraryService.CreateAsync`'e Activity oluşturma ekle
- [ ] `ActivityType.Library` enum değerini kontrol et
- [ ] Library entry oluşturulduğunda Activity oluştur

**Dosyalar**:
- `SocialLibrary.Infrastructure/Services/LibraryService.cs`
- `SocialLibrary.Domain/Enums/ActivityType.cs`

---

### **ADIM 5: Feed Sayfası ve Like/Comment UI** ⏱️ ~60 dk
**Hedef**: Feed'de Activity'leri göster ve Like/Comment butonları ekle

**Yapılacaklar**:
- [ ] `FeedPage.jsx` oluştur/güncelle
- [ ] Activity kartlarını göster (kullanıcı, içerik, tip, tarih)
- [ ] Like butonu ekle (beğen/beğenme)
- [ ] Comment butonu ve yorum formu ekle
- [ ] Yorumları göster (kullanıcı, metin, tarih)
- [ ] Infinite scroll veya pagination ekle
- [ ] `feedApi.js` oluştur/güncelle

**Dosyalar**:
- `sociallibrary.client/src/features/feed/pages/FeedPage.jsx`
- `sociallibrary.client/src/features/feed/components/ActivityCard.jsx` (YENİ)
- `sociallibrary.client/src/api/feedApi.js`
- `sociallibrary.client/src/api/activityApi.js`

---

### **ADIM 6: Library Content Bilgilerini Düzelt** ⏱️ ~30 dk
**Hedef**: Library'de Content bilgilerini doğru kategorize et

**Yapılacaklar**:
- [ ] `ContentDto`'ya `ContentType` ekle (backend)
- [ ] `LibraryService`'de Content bilgilerini include et
- [ ] `useLibrary.js`'de ContentType'a göre doğru kategoriye ekle (Movie/Book)
- [ ] `LibraryPage`'de Content bilgilerini göster

**Dosyalar**:
- `SocialLibrary.Application/DTOs/Content/ContentDto.cs`
- `SocialLibrary.Infrastructure/Services/ContentService.cs`
- `SocialLibrary.Infrastructure/Services/LibraryService.cs`
- `sociallibrary.client/src/features/library/hooks/useLibrary.js`

---

### **ADIM 7: List Content Bilgilerini Düzelt** ⏱️ ~30 dk
**Hedef**: List'lerde Content bilgilerini backend'den çek

**Yapılacaklar**:
- [ ] `ListService`'de ListItem'larda Content bilgilerini include et
- [ ] `ListDto`'ya Content bilgilerini ekle
- [ ] Frontend'de List sayfasında Content bilgilerini göster

**Dosyalar**:
- `SocialLibrary.Application/DTOs/List/ListDto.cs`
- `SocialLibrary.Infrastructure/Services/ListService.cs`
- `sociallibrary.client/src/features/list/pages/ListPage.jsx`

---

## 📝 Öncelik Sırası

1. **Yüksek Öncelik** (Hemen yapılmalı):
   - ADIM 2: Rating/Review backend'den çekme
   - ADIM 3: Activity Like/Comment endpoint'leri
   - ADIM 5: Feed sayfası ve Like/Comment UI

2. **Orta Öncelik**:
   - ADIM 1: Kayıt formu geliştirme
   - ADIM 4: Library Activity oluşturma
   - ADIM 6: Library Content bilgileri

3. **Düşük Öncelik**:
   - ADIM 7: List Content bilgileri

---

## 🔍 Test Senaryoları

Her adım sonrası test edilmeli:

1. **Rating/Review**: 
   - Puan ver → Backend'de kayıtlı mı?
   - Yorum yap → Backend'de kayıtlı mı?
   - Başka kullanıcı yorumları görebiliyor mu?

2. **Activity Like/Comment**:
   - Activity'yi beğen → Backend'de kayıtlı mı?
   - Yorum yap → Backend'de kayıtlı mı?
   - Beğeni sayısı doğru mu?

3. **Feed**:
   - Activity'ler gösteriliyor mu?
   - Like/Comment butonları çalışıyor mu?
   - Yorumlar gösteriliyor mu?

4. **Library**:
   - Library'ye ekle → Backend'de kayıtlı mı?
   - Activity oluşturuldu mu?
   - Content bilgileri doğru mu?

---

## 🚀 Başlangıç

İlk adım olarak **ADIM 2** ile başlayalım çünkü:
- Rating/Review zaten backend'e bağlı
- Sadece veri çekme kısmı eksik
- Diğer özellikler için temel oluşturur

**Hazır mısın? ADIM 2'ye başlayalım! 🎯**

