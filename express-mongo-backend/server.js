// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");

// const app = express();
// app.use(express.json());
// app.use(cors());

// mongoose.connect("mongodb+srv://user1:user1@dravya01.ioeeo.mongodb.net/ams?retryWrites=true&w=majority&appName=Dravya01", { useNewUrlParser: true, useUnifiedTopology: true });

// const assetSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   quantity: { type: Number, required: true },
//   manufactureDate: { type: String, default: () => new Date().toISOString().split("T")[0] },
//   status: { type: String, enum: ["working", "damaged"], default: "working" },
//   maintenanceReason: { type: String, default: "" }  // <-- Added this field
// });

// const Asset = mongoose.model("Asset", assetSchema);


// // Add asset
// app.post("/assets/add", async (req, res) => {
//   try {
//     console.log("Received Data:", req.body); // Debugging Line
//     const newAsset = new Asset(req.body);
//     await newAsset.save();
//     res.status(201).json({ message: "Asset added successfully!" });
//   } catch (error) {
//     console.error("Error saving asset:", error);
//     res.status(500).json({ message: "Server error", error });
//   }
// });

// // Get all assets
// app.get("/assets/", async (req, res) => {
//   const assets = await Asset.find();
//   res.json(assets);
// });

// // Delete asset
// app.delete("/assets/delete/:id", async (req, res) => {
//     try {
//       await Asset.findByIdAndDelete(req.params.id);
//       res.status(200).json({ message: "Asset deleted successfully!" });
//     } catch (error) {
//       res.status(500).json({ message: "Error deleting asset", error });
//     }
//   });
// app.put("/assets/maintenance/:id", async (req, res) => {
//     try {
//       const { reason } = req.body;
//       const updatedAsset = await Asset.findByIdAndUpdate(
//         req.params.id,
        
//         { new: true }
//       );
//       res.status(200).json(updatedAsset);
//     } catch (error) {
//       res.status(500).json({ message: "Error updating maintenance status", error });
//     }
//   });
    
// app.listen(5000, () => console.log("Server running on port 5000"));
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

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
  status: { type: String, enum: ["working", "damaged"], default: "working" },
  maintenanceReason: { type: String, default: "N/A" },
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
    const deletedAsset = await Asset.findByIdAndDelete(req.params.id);
    if (!deletedAsset) {
      return res.status(404).json({ message: "Asset not found" });
    }
    res.status(200).json({ message: "Asset deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting asset", error });
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
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: "Maintenance reason is required" });
    }

    const updatedAsset = await Asset.findByIdAndUpdate(
      req.params.id,
      { status: "damaged", maintenanceReason: reason },
      { new: true }
    );

    if (!updatedAsset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    res.status(200).json({ message: "Maintenance status updated", asset: updatedAsset });
  } catch (error) {
    res.status(500).json({ message: "Error updating maintenance status", error });
  }
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
