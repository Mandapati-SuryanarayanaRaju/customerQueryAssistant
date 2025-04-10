// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '8858',
  database: 'customerQueryAssistant'
});

db.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL');
});

const detectIntent = (question) => {
  if (/order\s*#?\d+/i.test(question)) return 'order_status';
  if (/refund/i.test(question)) return 'refund';
  if (/return|shipping|policy/i.test(question)) return 'policy';
  if (/nike|adidas|ultraboost|air max|shoe|product/i.test(question)) return 'product';
  return 'general';
};

async function fetchWithRetry(prompt, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await axios.post(
        'https://api-inference.huggingface.co/models/google/flan-t5-base',
        { inputs: prompt },
        {
          headers: {
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json'
          },
        }
      );
      return res.data[0]?.generated_text;
    } catch (err) {
      if (err.response?.status === 503 && i < retries - 1) {
        await new Promise(r => setTimeout(r, 1000));
      } else {
        return 'Sorry, the assistant is currently unavailable.';
      }
    }
  }
}

app.post('/ask', async (req, res) => {
  const userQuestion = req.body.question;
  const intent = detectIntent(userQuestion);
  let answer = '';

  try {
    if (intent === 'order_status') {
      const match = userQuestion.match(/order\s*#?(\d+)/i);
      const orderId = match?.[1];

      if (!orderId) {
        return res.json({ answer: "Please provide a valid order number." });
      }

      db.query('SELECT * FROM orders WHERE id = ?', [orderId], async (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
          const order = results[0];
          answer = `Your order #${orderId} is currently "${order.status}". ETA: ${order.eta}.`;
        } else {
          answer = `Sorry, I couldn't find an order with ID #${orderId}.`;
        }

        return res.json({ answer });
      });
      return;
    }

    if (intent === 'refund' || intent === 'policy') {
      db.query('SELECT * FROM policies', async (err, results) => {
        if (err) throw err;

        const policyText = results.map(row => `${row.type.toUpperCase()}: ${row.description}`).join('\n');
        const prompt = `User asked: "${userQuestion}"
Store policies:
${policyText}

Respond clearly and helpfully.`;

        answer = await fetchWithRetry(prompt);
        return res.json({ answer });
      });
      return;
    }

    if (intent === 'product') {
      db.query('SELECT * FROM products', async (err, results) => {
        if (err) throw err;

        const matches = results.filter(p =>
          userQuestion.toLowerCase().includes(p.name.toLowerCase()) ||
          userQuestion.toLowerCase().includes(p.description.toLowerCase())
        );

        const productText = matches.length
          ? matches.map(p => `✔ ${p.name} (Size ${p.size}) - $${p.price}\n${p.description}`).join('\n')
          : 'No matching products found.';

        const prompt = `User asked: "${userQuestion}"

Product Info:
${productText}

Give a short and helpful answer:`;

        answer = await fetchWithRetry(prompt);
        return res.json({ answer });
      });
      return;
    }

    // Handle general/generic questions
    const prompt = `User asked: "${userQuestion}"
Respond like a helpful virtual assistant in a friendly tone.`;
    answer = await fetchWithRetry(prompt);
    return res.json({ answer });

  } catch (err) {
    console.error('Error:', err.message);
    return res.json({ answer: 'Something went wrong while processing your request.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));