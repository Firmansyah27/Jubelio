CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(250) NOT NULL,
    sku VARCHAR(250) UNIQUE NOT NULL CHECK (sku <> '') CONSTRAINT sku_length CHECK (char_length(sku) >= 5),
    image VARCHAR(300),
    price NUMERIC(25,2),
    description TEXT
);