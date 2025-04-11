const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const authenticateToken = require('../middleware/authenticateToken');
require('dotenv').config(); // ✅ Make sure to load env variables

// REGISTER
router.post('/register', async (req, res) => {
  const { username, password, role = 'core' } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hashedPassword, role], (err) => {
      if (err) return res.status(500).json({ message: 'Registration failed' });
      res.status(200).json({ message: 'User registered successfully' });
    });
  } catch {
    res.status(500).json({ message: 'Error registering user' });
  }
});

// LOGIN
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
    if (err || results.length === 0) return res.status(401).json({ message: 'Login failed' });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    // ✅ Use secret from environment
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  });
});

module.exports = router;