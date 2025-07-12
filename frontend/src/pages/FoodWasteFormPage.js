import React, { useState } from 'react';
import axios from 'axios';

const FoodWasteFormPage = () => {
  const [form, setForm] = useState({ type: '', quantity: '', unit: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/food-waste', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(res.data.message || "Food donation submitted successfully!");
    } catch (err) {
      alert(err?.response?.data?.error || "Submission failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-lime-200 px-4">
      <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-2xl max-w-md w-full relative">
        {/* Leaf emoji */}
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
          <span className="text-4xl">🌿</span>
        </div>

        <h2 className="text-3xl font-bold text-center text-green-700 mb-6 mt-6">
          Donate Surplus Food
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">Type of Food</label>
            <input
              name="type"
              placeholder="e.g., Vegetables, Breads"
              value={form.type}
              onChange={handleChange}
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Quantity</label>
            <input
              name="quantity"
              type="number"
              placeholder="e.g., 10"
              value={form.quantity}
              onChange={handleChange}
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Unit</label>
            <input
              name="unit"
              placeholder="e.g., kg, g, liters"
              value={form.unit}
              onChange={handleChange}
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
          >
            Submit Donation
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Together, we can reduce food waste and nourish lives. 💚
        </p>
      </div>
    </div>
  );
};

export default FoodWasteFormPage;
