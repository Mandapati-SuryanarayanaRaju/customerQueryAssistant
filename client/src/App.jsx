import React from 'react';
import ChatBox from './components/ChatBox';

const App = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-center py-6">🛍️ E-Commerce Chat Assistant</h1>
      <ChatBox />
    </div>
  ); //check the errors in this App.jsx code 
};

export default App;