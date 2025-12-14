-- Export data from SQLite to SQL format
-- Run this script to export your current data before migrating to PostgreSQL

.mode insert User
SELECT * FROM User;

.mode insert Product
SELECT * FROM Product;

.mode insert Sale
SELECT * FROM Sale;

.mode insert SoldItem
SELECT * FROM SoldItem;
