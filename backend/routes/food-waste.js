const express = require("express");
const FoodWaste = require("../models/food-waste");
const authMiddleware = require("../middleware/authMiddleware"); // Import auth middleware
const router = express.Router();

// CREATE - Add new food waste (protected route)
router.post("/", authMiddleware, async (req, res) => {
  try {
    // Add the authenticated user as donor
    const foodWasteData = {
      ...req.body,
      donor: req.user._id,
      status: "available" // Default status
    };

    // Validate required fields
    if (!foodWasteData.type || !foodWasteData.quantity || !foodWasteData.unit) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const newFoodWaste = await FoodWaste.create(foodWasteData);
    
    res.status(201).json({
      success: true,
      data: newFoodWaste,
      message: "Food waste entry created successfully."
    });

  } catch (error) {
    console.error("Create food waste error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to add food waste.",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

// READ - Get all food waste entries (with filters)
router.get("/", async (req, res) => {
  try {
    // Build query based on filters
    const query = {};
    
    // Filter by type if provided
    if (req.query.type) {
      query.type = req.query.type;
    }
    
    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Filter by location if coordinates provided
    if (req.query.lat && req.query.lng) {
      query.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(req.query.lng), parseFloat(req.query.lat)]
          },
          $maxDistance: 10000 // 10km radius
        }
      };
    }

    const foodWastes = await FoodWaste.find(query)
      .populate("donor", "name email phone") // Include donor details
      .sort("-createdAt"); // Newest first

    res.status(200).json({
      success: true,
      count: foodWastes.length,
      data: foodWastes
    });

  } catch (error) {
    console.error("Get food wastes error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch food waste data."
    });
  }
});

// READ - Get specific food waste entry
router.get("/:id", async (req, res) => {
  try {
    const foodWaste = await FoodWaste.findById(req.params.id)
      .populate("donor", "name email phone");

    if (!foodWaste) {
      return res.status(404).json({
        success: false,
        error: "Food waste entry not found."
      });
    }

    res.status(200).json({
      success: true,
      data: foodWaste
    });

  } catch (error) {
    console.error("Get food waste error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch food waste entry."
    });
  }
});

// UPDATE - Modify food waste entry (protected)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    // Find the entry first to verify ownership
    let foodWaste = await FoodWaste.findById(req.params.id);

    if (!foodWaste) {
      return res.status(404).json({
        success: false,
        error: "Food waste entry not found."
      });
    }

    // Verify the user is the donor or admin
    if (foodWaste.donor.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Not authorized to update this entry."
      });
    }

    // Prevent changing certain fields
    const { donor, createdAt, ...updateData } = req.body;

    const updatedFoodWaste = await FoodWaste.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("donor", "name email phone");

    res.status(200).json({
      success: true,
      data: updatedFoodWaste,
      message: "Food waste updated successfully."
    });

  } catch (error) {
    console.error("Update food waste error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update food waste."
    });
  }
});
// CLAIM - Mark food waste as claimed (protected)
router.put("/:id/claim", authMiddleware, async (req, res) => {
  try {
    const foodWaste = await FoodWaste.findById(req.params.id);
    if (!foodWaste) {
      return res.status(404).json({ success: false, error: "Food waste not found." });
    }

    if (foodWaste.status !== "available") {
      return res.status(400).json({ success: false, error: "Food waste is not available to claim." });
    }

    foodWaste.status = "claimed";
    await foodWaste.save();

    res.status(200).json({ success: true, message: "Food waste claimed successfully." });
  } catch (err) {
    console.error("Claim error:", err);
    res.status(500).json({ success: false, error: "Failed to claim food waste." });
  }
});

// DELETE - Remove food waste entry (protected)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const foodWaste = await FoodWaste.findById(req.params.id);

    if (!foodWaste) {
      return res.status(404).json({
        success: false,
        error: "Food waste entry not found."
      });
    }

    // Verify the user is the donor or admin
    if (foodWaste.donor.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Not authorized to delete this entry."
      });
    }

    await foodWaste.remove();

    res.status(200).json({
      success: true,
      data: {},
      message: "Food waste entry deleted successfully."
    });

  } catch (error) {
    console.error("Delete food waste error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete food waste."
    });
  }
});

module.exports = router;