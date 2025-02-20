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
    const { status, maintenance_reason, quantity } = req.body;
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({ error: "Asset not found" });
    }

    if (quantity > asset.quantity) {
      return res.status(400).json({ error: "Requested quantity exceeds available quantity" });
    }

    // Create or update maintenance asset
    let maintenanceAsset = await Asset.findOne({
      asset_name: asset.asset_name,
      status: "Needs Maintenance"
    });

    if (maintenanceAsset) {
      maintenanceAsset.quantity += parseInt(quantity);
      await maintenanceAsset.save();
    } else {
      maintenanceAsset = new Asset({
        asset_name: asset.asset_name,
        asset_value: asset.asset_value,
        quantity: parseInt(quantity),
        status: "Needs Maintenance",
        maintenance_reason
      });
      await maintenanceAsset.save();
    }

    // Update original asset quantity
    asset.quantity -= parseInt(quantity);
    
    if (asset.quantity === 0) {
      await Asset.findByIdAndDelete(req.params.id);
    } else {
      await asset.save();
    }

    res.json({ message: "Asset updated", maintenanceAsset });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
