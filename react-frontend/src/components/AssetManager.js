import React, { useState, useEffect } from "react";
import axios from "axios";

function AssetManager() {
  const [assets, setAssets] = useState([]);
  const [newAsset, setNewAsset] = useState({
    asset_name: "",
    asset_value: "",
    date_added: "",
  });

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await axios.get("http://localhost:5001/assets/");
      setAssets(response.data);
    } catch (error) {
      console.error("Error fetching assets:", error);
    }
  };

  const addAsset = async () => {
    try {
      await axios.post("http://localhost:5001/assets/add", {
        ...newAsset,
        date_added: newAsset.date_added || new Date(),
      });
      fetchAssets();
      setNewAsset({ asset_name: "", asset_value: "", date_added: "" });
    } catch (error) {
      console.error("Error adding asset:", error);
    }
  };

  const deleteAsset = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/assets/delete/${id}`);
      fetchAssets();
    } catch (error) {
      console.error("Error deleting asset:", error);
    }
  };

  const markForMaintenance = async (id, totalQuantity) => {
    const quantity = prompt(`Enter quantity to mark for maintenance (max ${totalQuantity}):`);
    if (!quantity || isNaN(quantity) || quantity > totalQuantity || quantity <= 0) {
      alert("Please enter a valid quantity");
      return;
    }

    try {
      await axios.put(`http://localhost:5001/assets/maintenance/${id}`, {
        status: "Needs Maintenance",
        maintenance_reason: "Requires checkup",
        quantity: parseInt(quantity)
      });
      fetchAssets();
    } catch (error) {
      console.error("Error updating maintenance:", error);
    }
  };

  return (
    <div>
      <h1>Asset Management System</h1>

      <div>
        <input
          type="text"
          placeholder="Asset Name"
          value={newAsset.asset_name}
          onChange={(e) => setNewAsset({ ...newAsset, asset_name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Asset Value"
          value={newAsset.asset_value}
          onChange={(e) => setNewAsset({ ...newAsset, asset_value: e.target.value })}
        />
        <input
          type="date"
          value={newAsset.date_added}
          onChange={(e) => setNewAsset({ ...newAsset, date_added: e.target.value })}
        />
        <button onClick={addAsset}>Add Asset</button>
      </div>

      <table border="1">
        <thead>
          <tr>
            <th>Name</th>
            <th>Value</th>
            <th>Date Added</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <tr key={asset._id}>
              <td>{asset.asset_name}</td>
              <td>{asset.asset_value}</td>
              <td>{new Date(asset.date_added).toLocaleDateString()}</td>
              <td>{asset.status}</td>
              <td>
                <button onClick={() => deleteAsset(asset._id)}>Delete</button>
                <button onClick={() => markForMaintenance(asset._id, asset.quantity)}>Mark for Maintenance</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AssetManager;
