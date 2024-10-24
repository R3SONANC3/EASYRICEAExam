CREATE TABLE standards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE subStandards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    standardID INT,
    keyName VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    maxLength DECIMAL(10, 4),
    minLength DECIMAL(10, 4),
    conditionMax ENUM('LT', 'LE', 'GT', 'GE'),
    conditionMin ENUM('LT', 'LE', 'GT', 'GE'),
    FOREIGN KEY (standardID) REFERENCES standards(id) ON DELETE CASCADE
);

CREATE TABLE riceShapes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    code ENUM('wholegrain', 'broken') NOT NULL,
    description TEXT
);

CREATE TABLE riceTypes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    code ENUM('white', 'yellow', 'red', 'damage', 'paddy', 'chalky', 'glutinous') NOT NULL,
    description TEXT
);

CREATE TABLE samplingPoints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    code ENUM('front_end', 'back_end', 'other') NOT NULL
);

CREATE TABLE subStandardShapes (
    subStandardID INT,
    shapeID INT,
    PRIMARY KEY (subStandardID, shapeID),
    FOREIGN KEY (subStandardID) REFERENCES subStandards(id) ON DELETE CASCADE,
    FOREIGN KEY (shapeID) REFERENCES riceShapes(id) ON DELETE CASCADE
);

CREATE TABLE inspections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    standardID INT NOT NULL,
    note TEXT,
    price DECIMAL(10, 2) CHECK (price >= 0 AND price <= 100000),
    samplingDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    totalSamples INT,
    imagePath VARCHAR(255),
    rawDataPath VARCHAR(255),
    FOREIGN KEY (standardID) REFERENCES standards(id) ON DELETE CASCADE
);

CREATE TABLE inspectionSamplingPoints (
    inspectionID INT,
    samplingPointID INT,
    PRIMARY KEY (inspectionID, samplingPointID),
    FOREIGN KEY (inspectionID) REFERENCES inspections(id) ON DELETE CASCADE,
    FOREIGN KEY (samplingPointID) REFERENCES samplingPoints(id) ON DELETE CASCADE
);

CREATE TABLE grainDetails (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inspectionID INT,
    length DECIMAL(10, 4),
    weight DECIMAL(10, 4),
    shapeID INT,
    riceTypeID INT,
    FOREIGN KEY (inspectionID) REFERENCES inspections(id) ON DELETE CASCADE,
    FOREIGN KEY (shapeID) REFERENCES riceShapes(id) ON DELETE CASCADE,
    FOREIGN KEY (riceTypeID) REFERENCES riceTypes(id) ON DELETE CASCADE
);

DELIMITER //

CREATE TRIGGER afterGrainInsert
AFTER INSERT ON grainDetails
FOR EACH ROW
BEGIN
    UPDATE inspections
    SET totalSamples = (
        SELECT COUNT(*)
        FROM grainDetails
        WHERE inspectionID = NEW.inspectionID
        AND riceTypeID IN (
            SELECT id 
            FROM riceTypes 
            WHERE code != 'white'
        )
    )
    WHERE id = NEW.inspectionID;
END//

DELIMITER ;

INSERT INTO riceTypes (name, code, description) VALUES 
('White Rice', 'white', 'ข้าวขาว'),('Yellow Rice', 'yellow', 'ข้าวเหลือง'),('Red Rice', 'red', 'ข้าวแดง'),('Damaged Rice', 'damage', 'ข้าวเสียหาย'),
('Paddy Rice', 'paddy', 'ข้าวเปลือก'),('Chalky Rice', 'chalky', 'ข้าวท้องไข่'),('Glutinous Rice', 'glutinous', 'ข้าวเหนียว');

INSERT INTO riceShapes (name, code, description) VALUES 
('Whole Grain', 'wholegrain', 'ข้าวเมล็ดเต็ม'),
('Broken Rice', 'broken', 'ข้าวหัก');

INSERT INTO samplingPoints (name, code) VALUES 
('Front End', 'front_end'), 
('Back End', 'back_end'), 
('Other', 'other');

INSERT INTO standards (name, description) VALUES 
('มาตรฐานข้าวชั้น 1', 'มาตรฐานข้าวชั้น 1'),
('มาตรฐานข้าวชั้น 2', 'มาตรฐานข้าวชั้น 2');

INSERT INTO subStandards (standardID, keyName, name, maxLength, minLength, conditionMax, conditionMin) VALUES 
(1, 'wholegrain', 'ข้าวเต็มเมล็ด', 99.0000, 7.0000, 'LT', 'GT'),
(1, 'broken_rice1', 'ข้าวหักใหญ่', 7.0000, 3.5000, 'LT', 'GT');
(1, 'broken_rice2', 'ข้าวหักทั่วไป', 3.5000, 0.0000, 'LT', 'GT');
(2, 'wholegrain', 'ข้าวเต็มเมล็ด', 99.0000, 6.0000, 'LT', 'GT'),
(2, 'broken_rice1', 'ข้าวหักใหญ่', 6.0000, 4.5000, 'LT', 'GT');
(2, 'broken_rice2', 'ข้าวหักทั่วไป', 4.5000, 0.0000, 'LT', 'GT');

INSERT INTO subStandardShapes (subStandardID, shapeID) VALUES 
(1, 1), 
(2, 2);
(3, 2);
(4, 1);
(5, 2);
(6, 2);




