-- Alter purchases table: change unit_price and total_cost from DECIMAL(12,4) to INTEGER
ALTER TABLE purchases
    ALTER COLUMN unit_price TYPE INTEGER USING ROUND(unit_price),
    ALTER COLUMN total_cost TYPE INTEGER USING ROUND(total_cost);