import React, { useState, useEffect, useRef } from 'react';
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
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const userMessage = { sender: 'user', text: trimmedInput };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setTyping(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found. Please log in.');
      }

      console.log('🛡️ Sending token:', token);
      console.log('💬 Sending message:', trimmedInput);

      const res = await axios.post(
        'http://localhost:5000/api/chat',
        { message: trimmedInput },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const botMessage = { sender: 'bot', text: res.data.reply };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error('❌ Chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text:
            err.response?.data?.message ||
            '❌ Error: Could not get a response from the assistant.',
        },
      ]);
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
        {typing && (
          <div className="text-sm text-gray-500 italic">Assistant is typing...</div>
        )}
        <div ref={messagesEndRef} />
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