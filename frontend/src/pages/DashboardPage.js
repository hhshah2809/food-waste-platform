import React from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-lime-200 px-4">
      <div className="bg-white p-10 rounded-2xl shadow-2xl max-w-xl text-center w-full">
        <h1 className="text-4xl font-bold text-green-700 mb-4">
          🥦 Welcome to the Food Waste Reduction Platform
        </h1>
        <p className="text-gray-700 text-lg mb-8">
          Please choose an option to continue:
        </p>
        <div className="flex justify-center gap-6 flex-wrap">
          <button
            onClick={() => navigate('/login')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full text-lg font-semibold transition"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-6 py-3 rounded-full text-lg font-semibold transition"
          >
            Register
          </button>
        </div>
        <p className="mt-6 text-sm text-gray-600">
          Empowering communities by reducing food waste 💚
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;
