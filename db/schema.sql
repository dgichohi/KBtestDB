CREATE DATABASE IF NOT EXISTS kbtest_db;
USE kbtest_db;

-- Users Table
CREATE TABLE IF NOT EXISTS Users (
    userID        INT AUTO_INCREMENT,
    email         VARCHAR(150) NOT NULL UNIQUE,
    display_name  VARCHAR(160) NOT NULL,
    password      VARCHAR(280) NOT NULL,
    role          ENUM('admin', 'student') NOT NULL DEFAULT 'student',
    PRIMARY KEY (userID)
);

-- Project Table
CREATE TABLE IF NOT EXISTS Projects (
    projectID     INT AUTO_INCREMENT,
    title         VARCHAR(255) NOT NULL,
    description   VARCHAR(355),
    date_created  DATE,
    PRIMARY KEY (projectID),
    FOREIGN KEY (created_by) REFERENCES Users(userID) ON DELETE SET NULL
);

-- Document Table
CREATE TABLE IF NOT EXISTS Documents (
    documentID    INT AUTO_INCREMENT,
    projectID     INT NOT NULL,
    title         VARCHAR(220) NOT NULL,
    file_path     VARCHAR(500) NOT NULL,
    uploaded_by   INT,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (documentID),
    FOREIGN KEY (projectID) REFERENCES Projects(projectID) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES Users(userID) ON DELETE SET NULL
);

-- ProjectMembers Table (users in projects) 
CREATE TABLE IF NOT EXISTS ProjectMembers (
    projectID     INT NOT NULL,
    userID        INT NOT NULL,
    PRIMARY KEY (projectID, userID),
    FOREIGN KEY (projectID) REFERENCES Projects(projectID) ON DELETE CASCADE,
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE
);

-- DocumentCollaborators Table (users within team docs)
CREATE TABLE IF NOT EXISTS DocumentCollaborators (
    documentID    INT NOT NULL,
    userID        INT NOT NULL,
    PRIMARY KEY (documentID, userID),
    FOREIGN KEY (documentID) REFERENCES Documents(documentID) ON DELETE CASCADE,
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE
);
