import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-200 via-green-100 to-lime-200 px-4">
      <div className="bg-white p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] max-w-2xl w-full text-center transition-all duration-300 hover:scale-[1.01]">
        <h1 className="text-5xl font-extrabold text-green-800 mb-4 leading-tight">
          🌿 Reduce Food Waste, <br /> Empower the Hungry
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          Join us in making the world better—donate, manage, and track food efficiently.
        </p>
        <div className="flex justify-center flex-wrap gap-6">
          <Link
            to="/login"
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-semibold text-lg shadow-md transition"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-8 py-3 rounded-full font-semibold text-lg shadow-md transition"
          >
            Register
          </Link>
        </div>
        <div className="mt-8 text-sm text-gray-500">
          🍽️ Every plate counts. Let’s fight food waste together!
        </div>
      </div>
    </div>
  );
};

export default HomePage;
