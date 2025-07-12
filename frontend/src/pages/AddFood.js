import React, { useState } from 'react';
import axios from 'axios';

const AddFood = () => {
  const [form, setForm] = useState({
    type: 'prepared-food',
    quantity: '',
    unit: 'kg',
    description: '',
    address: '',
    lat: '',
    lng: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const lat = parseFloat(form.lat);
    const lng = parseFloat(form.lng);

    if (isNaN(lat) || isNaN(lng)) {
      alert("Please enter valid numeric coordinates.");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const location = {
        address: form.address,
        coordinates: [lng, lat]
      };

      const res = await axios.post('/api/food-waste', {
        type: form.type,
        quantity: Number(form.quantity),
        unit: form.unit,
        description: form.description,
        location
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      alert(res.data.message || "Food post added successfully!");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Failed to add food waste.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-lime-200 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-xl">
        <h2 className="text-3xl font-bold text-center text-green-700 mb-6">
          🥕 Add Food Waste Entry
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-green-500 outline-none"
            >
              <option value="prepared-food">Prepared Food</option>
              <option value="raw-ingredients">Raw Ingredients</option>
              <option value="perishable">Perishable</option>
              <option value="non-perishable">Non-Perishable</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Quantity</label>
            <input
              name="quantity"
              type="number"
              value={form.quantity}
              onChange={handleChange}
              required
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-green-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Unit</label>
            <select
              name="unit"
              value={form.unit}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-green-500 outline-none"
            >
              <option value="kg">kg</option>
              <option value="liters">liters</option>
              <option value="portions">portions</option>
              <option value="units">units</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description (optional)</label>
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-green-500 outline-none"
              placeholder="e.g., Leftover rice & curry"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              required
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-green-500 outline-none"
              placeholder="123 Green Street"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Latitude</label>
              <input
                name="lat"
                value={form.lat}
                onChange={handleChange}
                required
                className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-green-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Longitude</label>
              <input
                name="lng"
                value={form.lng}
                onChange={handleChange}
                required
                className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-green-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition"
          >
            ➕ Add Food
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddFood;
