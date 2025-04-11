// server/routes/products.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // Adjust if needed based on file location

// Get all products
router.get('/', (req, res) => {
  db.query('SELECT * FROM products', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Add product
router.post('/', (req, res) => {
  const { name, price, description, size } = req.body;
  if (!name || !price || !description || !size) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const query = 'INSERT INTO products (name, price, description, size) VALUES (?, ?, ?, ?)';
  db.query(query, [name, price, description, size], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id: result.insertId });
  });
});

// Delete product
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM products WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

module.exports = router;
