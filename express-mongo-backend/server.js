const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Connection Error:", err));

// Asset Schema
const assetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  manufactureDate: { type: String, default: () => new Date().toISOString().split("T")[0] },
  status: { type: String, enum: ["working", "damaged", "deleted"], default: "working" },
  maintenanceReason: { type: String, default: "N/A" },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
  deletionReason: { type: String }
});

const Asset = mongoose.model("Asset", assetSchema);

// Routes

// 📌 Fetch all assets
app.get("/assets", async (req, res) => {
  try {
    const assets = await Asset.find();
    res.status(200).json(assets);
  } catch (error) {
    res.status(500).json({ message: "Error fetching assets", error });
  }
});

// 📌 Add a new asset
app.post("/assets/add", async (req, res) => {
  try {
    const { name, quantity, manufactureDate, status } = req.body;

    const newAsset = new Asset({
      name,
      quantity,
      manufactureDate: manufactureDate || new Date().toISOString().split("T")[0],
      status: status || "working",
    });

    await newAsset.save();
    res.status(201).json({ message: "Asset added successfully", asset: newAsset });
  } catch (error) {
    res.status(500).json({ message: "Error adding asset", error });
  }
});

// 📌 Delete an asset
app.delete("/assets/delete/:id", async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }
    
    asset.isDeleted = true;
    asset.status = "deleted";
    asset.deletedAt = new Date();
    asset.deletionReason = req.body.reason || "Manual deletion";
    await asset.save();
    
    res.status(200).json({ message: "Asset deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting asset", error });
  }
});

// 📌 Fetch deleted assets
app.get("/assets/deleted", async (req, res) => {
  try {
    const assets = await Asset.find({ isDeleted: true });
    res.status(200).json(assets);
  } catch (error) {
    res.status(500).json({ message: "Error fetching deleted assets", error });
  }
});

// 📌 Update asset quantity (Increment/Decrement)
app.put("/assets/update-quantity/:id", async (req, res) => {
  try {
    const { change } = req.body;
    const asset = await Asset.findById(req.params.id);
    
    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    const newQuantity = Math.max(0, asset.quantity + change);
    asset.quantity = newQuantity;
    await asset.save();

    res.status(200).json({ message: "Quantity updated", quantity: newQuantity });
  } catch (error) {
    res.status(500).json({ message: "Error updating quantity", error });
  }
});

// 📌 Mark asset as damaged and add maintenance reason
app.put("/assets/maintenance/:id", async (req, res) => {
  try {
    const { reason, quantity } = req.body;
    const originalAsset = await Asset.findById(req.params.id);

    if (!originalAsset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    if (!reason) {
      return res.status(400).json({ message: "Maintenance reason is required" });
    }

    if (quantity > originalAsset.quantity) {
      return res.status(400).json({ message: "Invalid maintenance quantity" });
    }

    // Create or update maintenance asset
    let maintenanceAsset = await Asset.findOne({
      name: originalAsset.name,
      status: "damaged",
      maintenanceReason: reason
    });

    if (maintenanceAsset) {
      maintenanceAsset.quantity += quantity;
      await maintenanceAsset.save();
    } else {
      maintenanceAsset = new Asset({
        name: originalAsset.name,
        quantity: quantity,
        manufactureDate: originalAsset.manufactureDate,
        status: "damaged",
        maintenanceReason: reason
      });
      await maintenanceAsset.save();
    }

    // Update original asset
    const remainingQuantity = originalAsset.quantity - quantity;
    let workingAsset = null;

    if (remainingQuantity > 0) {
      originalAsset.quantity = remainingQuantity;
      await originalAsset.save();
      workingAsset = originalAsset;
    } else {
      await Asset.findByIdAndDelete(originalAsset._id);
    }

    res.status(200).json({
      message: "Maintenance status updated",
      workingAsset,
      maintenanceAsset
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating maintenance status", error });
  }
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
