const mongoose = require("mongoose");

const AssetSchema = new mongoose.Schema({
  asset_name: { type: String, required: true },
  asset_value: { type: String, required: true },
  date_added: { type: Date, default: Date.now },
  quantity: { type: Number, required: true, default: 1 },
  status: { type: String, enum: ["Working", "Needs Maintenance", "Damaged"], default: "Working" },
  maintenance_reason: { type: String, default: "" }
});

const Asset = mongoose.model("Asset", AssetSchema);

module.exports = Asset;
