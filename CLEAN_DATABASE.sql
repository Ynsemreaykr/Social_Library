-- VERİTABANI TEMİZLİK SORGULARI
-- DİKKAT: Bu sorguları çalıştırmadan önce yedek alın!

USE SocialLibraryDB;
GO

-- 1. Aynı ExternalId için hem Movie hem Book kaydı varsa, Book olanları sil (Movie öncelikli)
-- ÖNCE KONTROL ET:
SELECT ExternalId, ContentType, COUNT(*) as Count, STRING_AGG(CAST(Id AS VARCHAR), ', ') as ContentIds
FROM Contents
WHERE ExternalId IN (
    SELECT ExternalId
    FROM Contents
    GROUP BY ExternalId
    HAVING COUNT(DISTINCT ContentType) > 1
)
GROUP BY ExternalId, ContentType
ORDER BY ExternalId;

-- Eğer yukarıdaki sorgu sonuç döndürürse, Book olanları sil:
-- DELETE FROM Contents
-- WHERE Id IN (
--     SELECT c1.Id
--     FROM Contents c1
--     INNER JOIN Contents c2 ON c1.ExternalId = c2.ExternalId
--     WHERE c1.ContentType = 2 -- Book
--     AND c2.ContentType = 1 -- Movie
--     AND c1.Id != c2.Id
-- );

-- 2. Aynı ContentId için birden fazla LibraryEntry varsa, en son ekleneni tut, diğerlerini sil
-- ÖNCE KONTROL ET:
SELECT ContentId, UserId, COUNT(*) as Count, STRING_AGG(CAST(Id AS VARCHAR), ', ') as EntryIds
FROM LibraryEntries
GROUP BY ContentId, UserId
HAVING COUNT(*) > 1
ORDER BY ContentId, UserId;

-- Eğer yukarıdaki sorgu sonuç döndürürse, eski kayıtları sil:
-- DELETE FROM LibraryEntries
-- WHERE Id IN (
--     SELECT le1.Id
--     FROM LibraryEntries le1
--     INNER JOIN LibraryEntries le2 ON le1.ContentId = le2.ContentId AND le1.UserId = le2.UserId
--     WHERE le1.CreatedAt < le2.CreatedAt
-- );

-- 3. Aynı UserId ve ExternalId için farklı ContentType'larda LibraryEntry varsa, Book olanları sil
-- ÖNCE KONTROL ET:
SELECT 
    le.UserId,
    c.ExternalId,
    COUNT(DISTINCT c.ContentType) as TypeCount,
    STRING_AGG(CAST(c.ContentType AS VARCHAR), ', ') as Types,
    STRING_AGG(CAST(le.Id AS VARCHAR), ', ') as EntryIds
FROM LibraryEntries le
INNER JOIN Contents c ON le.ContentId = c.Id
GROUP BY le.UserId, c.ExternalId
HAVING COUNT(DISTINCT c.ContentType) > 1
ORDER BY le.UserId, c.ExternalId;

-- Eğer yukarıdaki sorgu sonuç döndürürse, Book olan LibraryEntry'leri sil:
-- DELETE FROM LibraryEntries
-- WHERE Id IN (
--     SELECT le.Id
--     FROM LibraryEntries le
--     INNER JOIN Contents c ON le.ContentId = c.Id
--     WHERE c.ContentType = 2 -- Book
--     AND EXISTS (
--         SELECT 1
--         FROM LibraryEntries le2
--         INNER JOIN Contents c2 ON le2.ContentId = c2.Id
--         WHERE le2.UserId = le.UserId
--         AND c2.ExternalId = c.ExternalId
--         AND c2.ContentType = 1 -- Movie
--         AND le2.Id != le.Id
--     )
-- );

