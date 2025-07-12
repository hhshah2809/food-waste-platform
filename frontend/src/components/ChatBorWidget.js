// components/ChatBotWidget.js
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

const ChatBotWidget = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Don’t show the widget on the chatbot page
  if (location.pathname === "/chatbot") return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => navigate("/chatbot")}
        className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg flex items-center justify-center"
        title="Chat with AgroAI"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  );
};

export default ChatBotWidget;
