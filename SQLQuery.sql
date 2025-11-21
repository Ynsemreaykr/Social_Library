USE SocialLibraryDB;
GO

-----------------------------------------------------
-- USERS
-----------------------------------------------------
CREATE TABLE Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(50) NOT NULL UNIQUE,
    Email NVARCHAR(120) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(MAX) NOT NULL,
    AvatarUrl NVARCHAR(MAX),
    Bio NVARCHAR(MAX),
    CreatedAt DATETIME NOT NULL DEFAULT(GETDATE())
);
GO


-----------------------------------------------------
-- PASSWORD RESET TOKENS
-----------------------------------------------------
CREATE TABLE PasswordResetTokens (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    Token NVARCHAR(255) NOT NULL UNIQUE,
    ExpiresAt DATETIME NOT NULL,
    Used BIT NOT NULL DEFAULT(0),
    CreatedAt DATETIME NOT NULL DEFAULT(GETDATE()),
    FOREIGN KEY (UserId) REFERENCES Users(Id)
);
GO


-----------------------------------------------------
-- FOLLOWS
-----------------------------------------------------
CREATE TABLE Follows (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    FollowerId INT NOT NULL,
    FollowingId INT NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT(GETDATE()),
    UNIQUE(FollowerId, FollowingId),
    FOREIGN KEY(FollowerId) REFERENCES Users(Id),
    FOREIGN KEY(FollowingId) REFERENCES Users(Id)
);
GO

CREATE INDEX IX_Follows_FollowerId ON Follows(FollowerId);
CREATE INDEX IX_Follows_FollowingId ON Follows(FollowingId);
GO


-----------------------------------------------------
-- CONTENTS
-----------------------------------------------------
CREATE TABLE Contents (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ExternalId NVARCHAR(100) NOT NULL,
    ContentType NVARCHAR(20) NOT NULL,
    Title NVARCHAR(300) NOT NULL,
    Year INT,
    PosterUrl NVARCHAR(MAX),
    ExtraJson NVARCHAR(MAX),
    CreatedAt DATETIME NOT NULL DEFAULT(GETDATE())
);
GO

ALTER TABLE Contents
ADD CONSTRAINT UQ_Contents_External UNIQUE(ExternalId, ContentType);
GO

ALTER TABLE Contents
ADD CONSTRAINT CK_Contents_ExtraJson_JSON
CHECK (ExtraJson IS NULL OR ISJSON(ExtraJson) = 1);
GO


-----------------------------------------------------
-- RATINGS
-----------------------------------------------------
CREATE TABLE Ratings (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    ContentId INT NOT NULL,
    Score INT NOT NULL CHECK (Score BETWEEN 1 AND 10),
    CreatedAt DATETIME NOT NULL DEFAULT(GETDATE()),
    UpdatedAt DATETIME NOT NULL DEFAULT(GETDATE()),
    UNIQUE(UserId, ContentId),
    FOREIGN KEY(UserId) REFERENCES Users(Id),
    FOREIGN KEY(ContentId) REFERENCES Contents(Id)
);
GO


-----------------------------------------------------
-- REVIEWS
-----------------------------------------------------
CREATE TABLE Reviews (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    ContentId INT NOT NULL,
    Text NVARCHAR(MAX) NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT(GETDATE()),
    UpdatedAt DATETIME NOT NULL DEFAULT(GETDATE()),
    FOREIGN KEY(UserId) REFERENCES Users(Id),
    FOREIGN KEY(ContentId) REFERENCES Contents(Id)
);
GO


-----------------------------------------------------
-- LIBRARY ENTRIES
-----------------------------------------------------
CREATE TABLE LibraryEntries (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    ContentId INT NOT NULL,
    EntryType NVARCHAR(20) NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT(GETDATE()),
    UNIQUE(UserId, ContentId),
    FOREIGN KEY(UserId) REFERENCES Users(Id),
    FOREIGN KEY(ContentId) REFERENCES Contents(Id)
);
GO


-----------------------------------------------------
-- LISTS
-----------------------------------------------------
CREATE TABLE Lists (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    Name NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX),
    CreatedAt DATETIME NOT NULL DEFAULT(GETDATE()),
    FOREIGN KEY(UserId) REFERENCES Users(Id)
);
GO

ALTER TABLE Lists
ADD CONSTRAINT UQ_Lists_UserId_Name UNIQUE(UserId, Name);
GO


-----------------------------------------------------
-- LIST ITEMS
-----------------------------------------------------
CREATE TABLE ListItems (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ListId INT NOT NULL,
    ContentId INT NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT(GETDATE()),
    UNIQUE(ListId, ContentId),
    FOREIGN KEY(ListId) REFERENCES Lists(Id),
    FOREIGN KEY(ContentId) REFERENCES Contents(Id)
);
GO

CREATE INDEX IX_ListItems_ListId ON ListItems(ListId);
GO


-----------------------------------------------------
-- ACTIVITIES
-----------------------------------------------------
CREATE TABLE Activities (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    ActivityType NVARCHAR(50) NOT NULL,
    ContentId INT NULL,
    RelatedId INT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT(GETDATE()),
    FOREIGN KEY(UserId) REFERENCES Users(Id),
    FOREIGN KEY(ContentId) REFERENCES Contents(Id)
);
GO

CREATE INDEX IX_Activities_UserId_CreatedAt
ON Activities(UserId, CreatedAt DESC);
GO


-----------------------------------------------------
-- ACTIVITY LIKES
-----------------------------------------------------
CREATE TABLE ActivityLikes (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    ActivityId INT NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT(GETDATE()),
    UNIQUE(UserId, ActivityId),
    FOREIGN KEY(UserId) REFERENCES Users(Id),
    FOREIGN KEY(ActivityId) REFERENCES Activities(Id)
);
GO


-----------------------------------------------------
-- ACTIVITY COMMENTS
-----------------------------------------------------
CREATE TABLE ActivityComments (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    ActivityId INT NOT NULL,
    Text NVARCHAR(MAX) NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT(GETDATE()),
    FOREIGN KEY(UserId) REFERENCES Users(Id),
    FOREIGN KEY(ActivityId) REFERENCES Activities(Id)
);
GO


-----------------------------------------------------
-- CASCADE DELETE DOĞRUDAN EKLENİYOR
-----------------------------------------------------

ALTER TABLE ActivityComments
ADD CONSTRAINT FK_ActivityComments_Activities
FOREIGN KEY (ActivityId) REFERENCES Activities(Id)
ON DELETE CASCADE;
GO

ALTER TABLE ActivityLikes
ADD CONSTRAINT FK_ActivityLikes_Activities
FOREIGN KEY (ActivityId) REFERENCES Activities(Id)
ON DELETE CASCADE;
GO


-----------------------------------------------------
-- TRIGGERS
-----------------------------------------------------
CREATE TRIGGER TRG_Ratings_Update
ON Ratings
AFTER UPDATE
AS
BEGIN
    UPDATE Ratings
    SET UpdatedAt = GETDATE()
    WHERE Id IN (SELECT Id FROM inserted);
END;
GO

CREATE TRIGGER TRG_Reviews_Update
ON Reviews
AFTER UPDATE
AS
BEGIN
    UPDATE Reviews
    SET UpdatedAt = GETDATE()
    WHERE Id IN (SELECT Id FROM inserted);
END;
GO
