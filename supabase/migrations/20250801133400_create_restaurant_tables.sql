-- Create ingredients table
CREATE TABLE IF NOT EXISTS ingredients (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    unit TEXT NOT NULL,
    category TEXT NOT NULL,
    stock DECIMAL(12,4) DEFAULT 0,
    average_price DECIMAL(12,4) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create recipe_components table
CREATE TABLE IF NOT EXISTS recipe_components (
    id SERIAL PRIMARY KEY,
    menu_item_id INTEGER NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    ingredient_id INTEGER NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
    gross_weight DECIMAL(12,4) NOT NULL,
    net_weight DECIMAL(12,4) NOT NULL,
    waste_percentage DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create production_expenses table
CREATE TABLE IF NOT EXISTS production_expenses (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    cost DECIMAL(12,2) NOT NULL,
    date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create purchases table
CREATE TABLE IF NOT EXISTS purchases (
    id SERIAL PRIMARY KEY,
    ingredient_id INTEGER NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    quantity DECIMAL(12,4) NOT NULL,
    unit_price INTEGER NOT NULL DEFAULT 0,
    total_cost INTEGER NOT NULL DEFAULT 0,
    payment_method TEXT NOT NULL,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_type TEXT NOT NULL,
    status TEXT DEFAULT 'Paid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sale_items table
CREATE TABLE IF NOT EXISTS sale_items (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    menu_item_id INTEGER NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL,
    cogs DECIMAL(12,4) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create write_offs table
CREATE TABLE IF NOT EXISTS write_offs (
    id SERIAL PRIMARY KEY,
    ingredient_id INTEGER NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    quantity DECIMAL(12,4) NOT NULL,
    type TEXT NOT NULL,
    reason TEXT,
    date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cost DECIMAL(12,4) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ingredients_category ON ingredients(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_recipe_components_menu_item ON recipe_components(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_recipe_components_ingredient ON recipe_components(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_purchases_ingredient ON purchases(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_purchases_date ON purchases(date_time);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date_time);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_menu_item ON sale_items(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_write_offs_ingredient ON write_offs(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_write_offs_date ON write_offs(date_time);
CREATE INDEX IF NOT EXISTS idx_write_offs_type ON write_offs(type);