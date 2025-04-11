const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();


// Importing routes
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const productRoutes = require('./routes/products'); // ✅ Make sure file name is correct

// Middleware
app.use(cors());
app.use(express.json());

// Mount routes
app.use('/api', authRoutes);
app.use('/api', chatRoutes);
app.use('/api/products', productRoutes); // ✅ Use sub-path specifically for products

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
