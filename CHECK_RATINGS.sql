-- Rating kayıtlarını kontrol et
-- Belirli bir içerik için tüm puanları göster

-- Önce tüm Rating kayıtlarını görelim
SELECT 
    r.Id,
    r.UserId,
    u.Username,
    r.ContentId,
    c.Title,
    c.ExternalId,
    r.Score,
    r.CreatedAt,
    r.UpdatedAt
FROM Ratings r
INNER JOIN Users u ON r.UserId = u.Id
INNER JOIN Contents c ON r.ContentId = c.Id
ORDER BY r.ContentId, r.UpdatedAt DESC;

-- Her içerik için ortalama puanı hesapla
SELECT 
    c.Id AS ContentId,
    c.ExternalId,
    c.Title,
    COUNT(r.Id) AS RatingCount,
    AVG(CAST(r.Score AS FLOAT)) AS AverageRating,
    STRING_AGG(CAST(r.Score AS VARCHAR), ', ') AS AllScores,
    STRING_AGG(u.Username + ':' + CAST(r.Score AS VARCHAR), ', ') AS UserScores
FROM Contents c
LEFT JOIN Ratings r ON c.Id = r.ContentId
LEFT JOIN Users u ON r.UserId = u.Id
GROUP BY c.Id, c.ExternalId, c.Title
HAVING COUNT(r.Id) > 0
ORDER BY c.Id;

-- Belirli bir ExternalId için kontrol (örnek: 496243)
DECLARE @ExternalId NVARCHAR(255) = '496243'; -- Buraya kontrol etmek istediğiniz ExternalId'yi yazın
DECLARE @ContentType INT = 1; -- 1 = Movie, 2 = Book

SELECT 
    c.Id AS ContentId,
    c.ExternalId,
    c.Title,
    COUNT(r.Id) AS RatingCount,
    AVG(CAST(r.Score AS FLOAT)) AS AverageRating,
    STRING_AGG(CAST(r.Score AS VARCHAR), ', ') AS AllScores,
    STRING_AGG(u.Username + ':' + CAST(r.Score AS VARCHAR), ', ') AS UserScores
FROM Contents c
LEFT JOIN Ratings r ON c.Id = r.ContentId
LEFT JOIN Users u ON r.UserId = u.Id
WHERE c.ExternalId = @ExternalId AND c.ContentType = @ContentType
GROUP BY c.Id, c.ExternalId, c.Title;

