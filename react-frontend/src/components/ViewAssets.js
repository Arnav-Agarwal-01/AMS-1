import React, { useEffect, useState } from "react";
import axios from "axios";

function ViewAssets({ setPage }) {
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/assets/")
      .then((response) => {
        setAssets(response.data);
      })
      .catch((error) => console.log(error));
  }, []);

  const updateQuantity = (id, change) => {
    axios.put(`http://localhost:5000/assets/update-quantity/${id}`, { change })
      .then((response) => {
        setAssets((prevAssets) =>
          prevAssets.map((asset) =>
            asset._id === id ? { ...asset, quantity: response.data.quantity } : asset
          )
        );
      })
      .catch((error) => console.log(error));
  };

  return (
    <div className="container">
      <h2>Available Assets</h2>

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
            </tr>
          ))}
        </tbody>
      </table>

      <h3>⚠️ Damaged Assets</h3>
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

      <button className="btn-back" onClick={() => setPage("landing")}>Back</button>
    </div>
  );
}

export default ViewAssets;
