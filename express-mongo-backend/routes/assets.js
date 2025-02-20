const express = require("express");
const router = express.Router();
const Asset = require("../asset_model");

// Fetch all assets
router.get("/", async (req, res) => {
  try {
    const assets = await Asset.find();
    res.json(assets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new asset
router.post("/add", async (req, res) => {
  const { asset_name, asset_value, date_added, status, maintenance_reason } = req.body;

  try {
    const newAsset = new Asset({
      asset_name,
      asset_value,
      date_added: date_added || new Date(),
      status: status || "Working",
      maintenance_reason: maintenance_reason || ""
    });

    await newAsset.save();
    res.json({ message: "Asset added successfully", asset: newAsset });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete an asset
router.delete("/delete/:id", async (req, res) => {
  try {
    await Asset.findByIdAndDelete(req.params.id);
    res.json({ message: "Asset deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark an asset for maintenance
router.put("/maintenance/:id", async (req, res) => {
  try {
    const { status, maintenance_reason } = req.body;
    const updatedAsset = await Asset.findByIdAndUpdate(
      req.params.id,
      { status, maintenance_reason },
      { new: true }
    );

    res.json({ message: "Asset updated", asset: updatedAsset });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
