// import React, { useState } from "react";
// import "./AssetManager.css"; // Import CSS file

// const AssetManager = () => {
//   const [assets, setAssets] = useState([]);
//   const [assetName, setAssetName] = useState("");
//   const [assetValue, setAssetValue] = useState("");

//   const handleAddAsset = () => {
//     if (!assetName || !assetValue) {
//       alert("Please enter both asset name and value.");
//       return;
//     }
    
//     const newAsset = {
//       id: assets.length + 1,
//       name: assetName,
//       value: assetValue,
//     };

//     setAssets([...assets, newAsset]);
//     setAssetName("");
//     setAssetValue("");
//   };

//   return (
//     <div className="container">
//       <h1>Asset Management System</h1>
//       <div className="input-group">
//         <input
//           type="text"
//           placeholder="Enter asset name"
//           value={assetName}
//           onChange={(e) => setAssetName(e.target.value)}
//         />
//         <input
//           type="text"
//           placeholder="Enter asset value"
//           value={assetValue}
//           onChange={(e) => setAssetValue(e.target.value)}
//         />
//         <button onClick={handleAddAsset}>Add Asset</button>
//       </div>
//       <table>
//         <thead>
//           <tr>
//             <th>ID</th>
//             <th>Asset Name</th>
//             <th>Value</th>
//           </tr>
//         </thead>
//         <tbody>
//           {assets.map((asset) => (
//             <tr key={asset.id}>
//               <td>{asset.id}</td>
//               <td>{asset.name}</td>
//               <td>{asset.value}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default AssetManager;
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
      const response = await axios.get("http://localhost:5000/assets/");
      setAssets(response.data);
    } catch (error) {
      console.error("Error fetching assets:", error);
    }
  };

  const addAsset = async () => {
    try {
      await axios.post("http://localhost:5000/assets/add", {
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
      await axios.delete(`http://localhost:5000/assets/delete/${id}`);
      fetchAssets();
    } catch (error) {
      console.error("Error deleting asset:", error);
    }
  };

  const markForMaintenance = async (id) => {
    try {
      await axios.put(`http://localhost:5000/assets/maintenance/${id}`, {
        status: "Needs Maintenance",
        maintenance_reason: "Requires checkup",
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
                <button onClick={() => markForMaintenance(asset._id)}>Mark for Maintenance</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AssetManager;
