const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const db = require('../db');
const axios = require('axios');
require('dotenv').config();

// Utility to run db.query as a promise
function runQuery(sql, params) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

// Call Hugging Face API
const fetchWithRetry = async (prompt) => {
  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/tiiuae/falcon-7b-instruct',
      { inputs: `Q: ${prompt}\nA:` },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 20000,
      }
    );

    const output = response.data;
    if (Array.isArray(output)) {
      return output[0]?.generated_text || "🤖 No response generated.";
    } else {
      return "🤖 Unexpected response format.";
    }
  } catch (error) {
    console.error("AI Fetch Error:", error?.response?.data || error.message);
    return "❌ Failed to connect to AI model. Check your Hugging Face API key.";
  }
};

router.post('/chat', verifyToken, async (req, res) => {
  const userQuestion = req.body.message?.trim().toLowerCase();
  let answer = '';

  const intent = (() => {
    if (/order\s*#?\d+/i.test(userQuestion)) return 'order_status';
    if (/refund|return/i.test(userQuestion)) return 'refund';
    if (/policy|policies/i.test(userQuestion)) return 'policy';
    if (/product|price|available|nike|adidas|shoes/i.test(userQuestion)) return 'product';
    return 'general';
  })();

  try {
    if (intent === 'order_status') {
      const match = userQuestion.match(/order\s*#?(\d+)/i);
      const orderId = match?.[1];

      if (!orderId) return res.json({ reply: 'Please provide a valid order number.' });

      const results = await runQuery('SELECT * FROM orders WHERE id = ?', [orderId]);

      if (results.length > 0) {
        const order = results[0];
        answer = `Your order #${orderId} is currently \"${order.status}\". ETA: ${order.eta}.`;
      } else {
        answer = `Sorry, I couldn't find an order with ID #${orderId}.`;
      }

      return res.json({ reply: answer });
    }

    if (intent === 'refund' || intent === 'policy') {
      const results = await runQuery('SELECT * FROM policies');
      const policyText = results.map(row => `${row.type.toUpperCase()}: ${row.description}`).join('\n');
      const prompt = `User asked: \"${userQuestion}\"\nStore policies:\n${policyText}\n\nRespond clearly and helpfully.`;

      answer = await fetchWithRetry(prompt);
      return res.json({ reply: answer });
    }

    if (intent === 'product') {
      const results = await runQuery('SELECT * FROM products');
      const matches = results.filter(p =>
        userQuestion.includes(p.name.toLowerCase()) ||
        userQuestion.includes(p.description.toLowerCase())
      );

      const productText = matches.length
        ? matches.map(p => `✔ ${p.name} (Size ${p.size}) - $${p.price}\n${p.description}`).join('\n')
        : 'No matching products found.';

      const prompt = `Product Info:\n${productText}\n\nGive a short and helpful answer:`;

      answer = await fetchWithRetry(prompt);
      return res.json({ reply: answer });
    }

    // General greetings
    const greetings = [
      { keywords: ['hi', 'hello', 'hey'], response: "Hi there! How can I help you today?" },
      { keywords: ['how are you'], response: "I'm doing great, thanks for asking! How can I help you today?" },
      { keywords: ['what\'s up', 'whats up'], response: "Just hanging out and ready to help!" },
      { keywords: ['who are you'], response: "I'm your friendly store assistant bot 🤖. Ask me anything!" }
    ];

    const matched = greetings.find(g => g.keywords.some(k => userQuestion.includes(k)));
    if (matched) return res.json({ reply: matched.response });

    // Fallback to AI model
    const prompt = `User asked: \"${userQuestion}\"\nRespond like a helpful virtual assistant.`;
    answer = await fetchWithRetry(prompt);
    return res.json({ reply: answer });

  } catch (err) {
    console.error('Error:', err.message);
    return res.status(500).json({ reply: 'Something went wrong while processing your request.' });
  }
});

module.exports = router;