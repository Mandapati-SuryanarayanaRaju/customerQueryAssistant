CREATE DATABASE IF NOT EXISTS customerQueryAssistant;
USE customerQueryAssistant;

CREATE TABLE IF NOT EXISTS orders (
  id INT PRIMARY KEY,
  status VARCHAR(50),
  eta VARCHAR(100)
);

INSERT INTO orders VALUES
(12345, 'Shipped', '2-3 business days'),
(98765, 'Delivered', 'Delivered on April 3');

CREATE TABLE IF NOT EXISTS policies (
  type VARCHAR(50),
  description TEXT
);

INSERT INTO policies VALUES
('refund', 'You can request a refund within 30 days of purchase.'),
('return', 'Returns accepted within 30 days if unused.'),
('shipping', 'Free shipping on orders over $50.');

CREATE TABLE IF NOT EXISTS products (
  name VARCHAR(100),
  size VARCHAR(10),
  price DECIMAL(10,2),
  description TEXT
);

INSERT INTO products VALUES
('Nike Air Max', '9', 120.00, 'Comfortable running shoes.'),
('Adidas UltraBoost', '10', 150.00, 'Performance sneakers.'),
('Nike Revolution', '8', 95.00, 'Affordable sportswear.');
