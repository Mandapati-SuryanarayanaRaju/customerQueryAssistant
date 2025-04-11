const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '8858',        // Replace with your actual password
  database: 'chatbot'  // Your DB name
});

connection.connect((err) => {
  if (err) throw err;
  console.log('✅ Connected to MySQL');
  if (err) {
    console.error('DB Error:', err);
    return res.status(500).json({ reply: 'Server error while fetching data.' });
  }
});




module.exports = connection;
