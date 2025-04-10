import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TypeWriter = ({ text, speed = 20 }) => {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(prev => prev + text.charAt(i));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text]);

  return <>{displayed}</>;
};

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setTyping(true);

    try {
      const res = await axios.post('http://localhost:3000/ask', { question: input });
      const botMessage = { sender: 'bot', text: res.data.answer };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Error: Could not get a response.' }]);
    } finally {
      setTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-2xl shadow-lg p-6 h-[500px] overflow-y-auto flex flex-col gap-2">
        {messages.map((msg, index) => {
          const isLatestBot = msg.sender === 'bot' && index === messages.length - 1;
          return (
            <div
              key={index}
              className={`p-3 rounded-xl max-w-[80%] ${
                msg.sender === 'user'
                  ? 'bg-blue-500 text-white self-end'
                  : 'bg-gray-200 text-black self-start'
              }`}
            >
              {isLatestBot && typing ? <TypeWriter text={msg.text} /> : msg.text}
            </div>
          );
        })}
        {typing && <div className="text-sm text-gray-500 italic">Assistant is typing...</div>}
      </div>

      <div className="flex mt-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-1 p-3 border border-gray-300 rounded-l-2xl focus:outline-none"
          placeholder="Ask me about orders, refunds, or products..."
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-6 rounded-r-2xl hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
