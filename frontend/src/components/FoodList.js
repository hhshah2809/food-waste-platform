import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const FoodList = () => {
  const [foodWastes, setFoodWastes] = useState([]);
  const [filters, setFilters] = useState({ type: '', status: '' });
  const navigate = useNavigate();

  const fetchFoodWaste = async () => {
    try {
      const query = new URLSearchParams();
      if (filters.type) query.append('type', filters.type);
      if (filters.status) query.append('status', filters.status);

      const res = await axios.get(`/api/food-waste?${query.toString()}`);
      setFoodWastes(res.data.data);
    } catch (error) {
      console.error("Failed to fetch food waste entries:", error);
      alert("Could not fetch food waste entries.");
    }
  };

  const claimFood = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`/api/food-waste/${id}/claim`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(res.data.message || "Food claimed!");
      fetchFoodWaste();
    } catch (err) {
      console.error("Claim error:", err);
      alert(err?.response?.data?.error || "Failed to claim food.");
    }
  };

  useEffect(() => {
    fetchFoodWaste();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-lime-100 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl p-6">
        <h2 className="text-3xl font-bold text-green-700 mb-4">🍽️ Available Food Entries</h2>

        <div className="mb-4 flex flex-wrap items-center gap-4">
          <button
            onClick={() => navigate('/add-food')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow"
          >
            ➕ Add Food Waste
          </button>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Type:</label>
            <select
              className="border rounded px-2 py-1"
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              value={filters.type}
            >
              <option value="">All</option>
              <option value="prepared-food">Prepared</option>
              <option value="raw-ingredients">Raw</option>
              <option value="perishable">Perishable</option>
              <option value="non-perishable">Non-Perishable</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Status:</label>
            <select
              className="border rounded px-2 py-1"
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              value={filters.status}
            >
              <option value="">All</option>
              <option value="available">Available</option>
              <option value="claimed">Claimed</option>
              <option value="distributed">Distributed</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <button
            onClick={fetchFoodWaste}
            className="bg-gray-100 hover:bg-gray-200 text-sm px-3 py-1 rounded border"
          >
            Apply
          </button>
        </div>

        {foodWastes.length === 0 ? (
          <p className="text-gray-500 text-center">No food waste entries found.</p>
        ) : (
          <ul className="space-y-4">
            {foodWastes.map((item) => (
              <li key={item._id} className="border rounded-lg p-4 shadow-sm bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-lg font-semibold text-green-700 capitalize">{item.type}</h4>
                    <p className="text-sm text-gray-700">
                      {item.quantity} {item.unit}
                    </p>
                    <p className="text-sm text-gray-600 italic">{item.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Donor: <span className="font-medium">{item.donor?.name || "Anonymous"}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Location: {item.location?.address || "N/A"}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Status: <span className="font-semibold">{item.status}</span>
                    </p>
                  </div>

                  {item.status === 'available' && (
                    <button
                      onClick={() => claimFood(item._id)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-2 text-sm rounded shadow"
                    >
                      Claim
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FoodList;
