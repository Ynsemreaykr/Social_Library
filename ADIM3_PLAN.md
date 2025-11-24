# 🎯 ADIM 3: Activity Like/Comment Endpoint'leri

## 📋 Hedef
Activity'leri beğenme ve yorumlama endpoint'leri oluşturmak.

## ✅ Mevcut Durum
- ✅ `ActivityLike` ve `ActivityComment` entity'leri var
- ✅ Repository'ler var (`IActivityLikeRepository`, `IActivityCommentRepository`)
- ❌ `ActivityController` yok
- ❌ `IActivityService` yok
- ❌ Frontend'de Like/Comment API fonksiyonları yok

## 🔧 Yapılacaklar

### 1. Backend: IActivityService Interface
- `LikeActivityAsync(int userId, int activityId)`
- `UnlikeActivityAsync(int userId, int activityId)`
- `CommentActivityAsync(int userId, int activityId, string text)`
- `GetActivityCommentsAsync(int activityId)`
- `GetActivityLikesAsync(int activityId)`

### 2. Backend: ActivityService Implementation
- Service layer'da business logic

### 3. Backend: ActivityController
- `POST /api/Activity/{activityId}/like` - Beğen
- `DELETE /api/Activity/{activityId}/like` - Beğenmeyi kaldır
- `POST /api/Activity/{activityId}/comment` - Yorum yap
- `GET /api/Activity/{activityId}/comments` - Yorumları getir
- `GET /api/Activity/{activityId}/likes` - Beğenileri getir

### 4. Frontend: activityApi.js
- `likeActivity(activityId)`
- `unlikeActivity(activityId)`
- `commentActivity(activityId, text)`
- `getActivityComments(activityId)`
- `getActivityLikes(activityId)`

## 📝 Dosyalar
- `SocialLibrary.Application/Interfaces/Services/IActivityService.cs` (YENİ)
- `SocialLibrary.Infrastructure/Services/ActivityService.cs` (YENİ)
- `SocialLibrary.Server/Controllers/ActivityController.cs` (YENİ)
- `sociallibrary.client/src/api/activityApi.js` (YENİ)

## 🚀 Başlayalım!

