-- Veritabanı kontrol sorguları
-- Aynı ExternalId için hem Movie hem Book kaydı var mı?
SELECT ExternalId, ContentType, COUNT(*) as Count, STRING_AGG(CAST(Id AS VARCHAR), ', ') as ContentIds
FROM Contents
GROUP BY ExternalId, ContentType
HAVING COUNT(*) > 1
ORDER BY ExternalId;

-- Aynı ExternalId için farklı ContentType'lar var mı?
SELECT ExternalId, COUNT(DISTINCT ContentType) as TypeCount, STRING_AGG(CAST(ContentType AS VARCHAR), ', ') as Types
FROM Contents
GROUP BY ExternalId
HAVING COUNT(DISTINCT ContentType) > 1
ORDER BY ExternalId;

-- LibraryEntry'lerde ContentType bilgisini göster
SELECT 
    le.Id as LibraryEntryId,
    le.UserId,
    le.ContentId,
    le.Status,
    c.ExternalId,
    c.ContentType,
    c.Title
FROM LibraryEntries le
INNER JOIN Contents c ON le.ContentId = c.Id
ORDER BY le.UserId, le.ContentId;

-- Aynı ContentId için birden fazla LibraryEntry var mı?
SELECT ContentId, UserId, COUNT(*) as Count, STRING_AGG(CAST(Id AS VARCHAR), ', ') as EntryIds
FROM LibraryEntries
GROUP BY ContentId, UserId
HAVING COUNT(*) > 1
ORDER BY ContentId, UserId;

-- Aynı UserId ve ExternalId için farklı ContentType'larda LibraryEntry var mı?
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

