-- Lost and Found database: all SQL used by the project
CREATE DATABASE IF NOT EXISTS lost_and_found
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lost_and_found;

DROP TABLE IF EXISTS items;

CREATE TABLE items (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name           VARCHAR(100) NOT NULL,                 -- what the item is
  category       ENUM('phone','keys','id_card','book','bag','clothing',
                      'electronics','wallet','other') NOT NULL,
  description    TEXT NULL,
  location_found VARCHAR(150) NOT NULL,                 -- where it was found
  date_found     DATETIME NOT NULL,                     -- when it was found
  is_claimed     TINYINT(1) NOT NULL DEFAULT 0,         -- 0 = unclaimed, 1 = claimed
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                 ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_category (category),
  INDEX idx_is_claimed (is_claimed)
) ENGINE=InnoDB;

-- Sample data
INSERT INTO items (name, category, description, location_found, date_found, is_claimed) VALUES
('Black iPhone 13', 'phone', 'Cracked corner, blue case', 'Library, 2nd floor', '2026-11-02 14:30:00', 0),
('Set of 3 keys', 'keys', 'Red keychain with a star', 'Cafeteria', '2026-11-03 09:15:00', 0),
('Student ID card', 'id_card', 'Name: Abebe K.', 'Lecture Hall B', '2026-11-04 11:00:00', 1),
('Calculus textbook', 'book', 'Stewart, 8th edition', 'Study room 4', '2026-11-05 16:45:00', 0);

-- Statements used by the API (parameterised in code)
-- SELECT * FROM items [WHERE category = ? AND is_claimed = ?] ORDER BY date_found DESC;
-- SELECT * FROM items WHERE id = ?;
-- INSERT INTO items (name, category, description, location_found, date_found, is_claimed) VALUES (?,?,?,?,?,?);
-- UPDATE items SET name=?, category=?, description=?, location_found=?, date_found=?, is_claimed=? WHERE id=?;
-- DELETE FROM items WHERE id = ?;
