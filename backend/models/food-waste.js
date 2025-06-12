const mongoose = require("mongoose");

const foodWasteSchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true,
    enum: ["perishable", "non-perishable", "prepared-food", "raw-ingredients"],
    trim: true
  },
  quantity: { 
    type: Number, 
    required: true,
    min: [1, "Quantity must be at least 1"] 
  },
  unit: {
    type: String,
    required: true,
    enum: ["kg", "liters", "portions", "units"],
    default: "kg"
  },
  date: { 
    type: Date, 
    default: Date.now,
    index: true  // Better for querying by date
  },
  donor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",  // Reference to User model
    required: true 
  },
  location: {
    address: { type: String, required: true },
    coordinates: {
      type: [Number],  // [longitude, latitude]
      index: "2dsphere"  // For geospatial queries
    }
  },
  status: {
    type: String,
    enum: ["available", "claimed", "distributed", "expired"],
    default: "available"
  },
  description: {
    type: String,
    maxlength: [500, "Description cannot exceed 500 characters"]
  },
  images: [String]  // Array of image URLs
}, {
  timestamps: true  // Adds createdAt and updatedAt automatically
});

// Index for frequently queried fields
foodWasteSchema.index({ type: 1, status: 1 });

module.exports = mongoose.model("FoodWaste", foodWasteSchema);