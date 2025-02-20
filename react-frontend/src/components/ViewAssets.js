import React, { useEffect, useState } from "react";
import axios from "axios";

function ViewAssets({ setPage }) {
  const [assets, setAssets] = useState([]);
  const [deletedAssets, setDeletedAssets] = useState([]);
  const [maintenanceReason, setMaintenanceReason] = useState("");
  const [maintenanceQuantity, setMaintenanceQuantity] = useState(1);
  const [selectedAsset, setSelectedAsset] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5001/assets/")
      .then((response) => {
        setAssets(response.data.filter(asset => !asset.isDeleted));
      })
      .catch((error) => console.log(error));

    axios.get("http://localhost:5001/assets/deleted")
      .then((response) => {
        setDeletedAssets(response.data);
      })
      .catch((error) => console.log(error));
  }, []);

  const updateQuantity = async (id, change) => {
    try {
      const asset = assets.find(a => a._id === id);
      const newQuantity = asset.quantity + change;

      if (newQuantity <= 0) {
        const reason = prompt("Please enter a reason for deletion:");
        if (reason) {
          await axios.delete(`http://localhost:5001/assets/delete/${id}`, { 
            data: { reason } 
          });
          setAssets(prevAssets => prevAssets.filter(asset => asset._id !== id));
          const deletedResponse = await axios.get("http://localhost:5001/assets/deleted");
          setDeletedAssets(deletedResponse.data);
        }
      } else {
        const response = await axios.put(`http://localhost:5001/assets/update-quantity/${id}`, { change });
        setAssets(prevAssets =>
          prevAssets.map(asset =>
            asset._id === id ? { ...asset, quantity: response.data.quantity } : asset
          )
        );
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const handleMaintenance = (asset) => {
    if (maintenanceQuantity > asset.quantity) {
      alert(`Cannot send more items to maintenance than available (${asset.quantity})`);
      return;
    }
    setSelectedAsset(asset);
  };

  const submitMaintenance = async () => {
    if (!maintenanceReason) {
      alert("Please enter a maintenance reason");
      return;
    }

    if (maintenanceQuantity <= 0) {
      alert("Please enter a valid maintenance quantity");
      return;
    }

    try {
      const response = await axios.put(`http://localhost:5001/assets/maintenance/${selectedAsset._id}`, {
        reason: maintenanceReason,
        quantity: maintenanceQuantity
      });

      setAssets(prevAssets => {
        let updatedAssets = prevAssets.filter(a => a._id !== selectedAsset._id);
        
        // Add working asset back if it exists
        if (response.data.workingAsset) {
          updatedAssets.push(response.data.workingAsset);
        }

        // Add or update maintenance asset
        if (response.data.maintenanceAsset) {
          const maintenanceIndex = updatedAssets.findIndex(
            a => a._id === response.data.maintenanceAsset._id
          );
          if (maintenanceIndex >= 0) {
            updatedAssets[maintenanceIndex] = response.data.maintenanceAsset;
          } else {
            updatedAssets.push(response.data.maintenanceAsset);
          }
        }

        return updatedAssets;
      });
      
      setSelectedAsset(null);
      setMaintenanceReason("");
      setMaintenanceQuantity(1);
    } catch (error) {
      console.error("Error marking for maintenance:", error);
      alert("Error updating maintenance status");
    }
  };

  return (
    <div className="container">
      <h2>Available Assets</h2>

      {selectedAsset && (
        <div className="maintenance-modal">
          <h3>Maintenance Details for {selectedAsset.name}</h3>
          <div>
            <label>Quantity to send for maintenance:</label>
            <input
              type="number"
              min="1"
              max={selectedAsset.quantity}
              value={maintenanceQuantity}
              onChange={(e) => setMaintenanceQuantity(parseInt(e.target.value))}
            />
          </div>
          <textarea
            value={maintenanceReason}
            onChange={(e) => setMaintenanceReason(e.target.value)}
            placeholder="Enter maintenance reason..."
          />
          <div>
            <button onClick={submitMaintenance}>Submit</button>
            <button onClick={() => setSelectedAsset(null)}>Cancel</button>
          </div>
        </div>
      )}

      <h3>✅ Working Assets</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Quantity</th>
            <th>Manufacture Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {assets.filter(asset => asset.status === "working").map((asset) => (
            <tr key={asset._id}>
              <td>{asset.name}</td>
              <td>
                {asset.quantity}
                <button onClick={() => updateQuantity(asset._id, 1)}>➕</button>
                <button onClick={() => updateQuantity(asset._id, -1)}>➖</button>
              </td>
              <td>{asset.manufactureDate}</td>
              <td>
                <button onClick={() => handleMaintenance(asset)}>
                  Send to Maintenance
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>⚠️ Under Maintenance</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Maintenance Reason</th>
            <th>Manufacture Date</th>
          </tr>
        </thead>
        <tbody>
          {assets.filter(asset => asset.status === "damaged").map((asset) => (
            <tr key={asset._id}>
              <td>{asset.name}</td>
              <td>{asset.maintenanceReason || "N/A"}</td>
              <td>{asset.manufactureDate}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>❌ Deleted Assets</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Manufacture Date</th>
            <th>Deletion Date</th>
            <th>Reason</th>
          </tr>
        </thead>
        <tbody>
          {deletedAssets.map((asset) => (
            <tr key={asset._id}>
              <td>{asset.name}</td>
              <td>{asset.manufactureDate}</td>
              <td>{new Date(asset.deletedAt).toLocaleDateString()}</td>
              <td>{asset.deletionReason}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="btn-back" onClick={() => setPage("landing")}>Back</button>
    </div>
  );
}

export default ViewAssets;
