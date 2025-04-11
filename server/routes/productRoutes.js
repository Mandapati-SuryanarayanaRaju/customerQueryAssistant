const express = require('express');
const router = express.Router();
const db = require('../db'); // Adjusted relative path to your db.js

// GET all products
router.get('/', (req, res) => {
  db.query('SELECT * FROM products', (err, results) => {
    if (err) {
      console.error('Error fetching products:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// POST add a new product
router.post('/', (req, res) => {
  const { name, price, description, size } = req.body;

  if (!name || !price || !description || !size) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const sql = 'INSERT INTO products (name, price, description, size) VALUES (?, ?, ?, ?)';
  db.query(sql, [name, price, description, size], (err, result) => {
    if (err) {
      console.error('Error adding product:', err);
      return res.status(500).json({ error: 'Failed to add product' });
    }
    res.json({ message: 'Product added successfully', id: result.insertId });
  });
});

// DELETE a product by ID
router.delete('/:id', (req, res) => {
  const productId = req.params.id;

  db.query('DELETE FROM products WHERE id = ?', [productId], (err) => {
    if (err) {
      console.error('Error deleting product:', err);
      return res.status(500).json({ error: 'Failed to delete product' });
    }
    res.json({ message: 'Product deleted successfully' });
  });
});

module.exports = router;
