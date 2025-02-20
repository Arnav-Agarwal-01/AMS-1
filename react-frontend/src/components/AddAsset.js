import React, { useState } from "react";
import axios from "axios";

function AddAsset({ setPage }) {
  const [asset, setAsset] = useState({
    name: "",
    quantity: "",
    manufactureDate: "",
    status: "working",
  });

  const handleChange = (e) => {
    setAsset({ ...asset, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Set current date if not provided
    const updatedAsset = {
      ...asset,
      manufactureDate: asset.manufactureDate || new Date().toISOString().split("T")[0],
    };

    try {
      const response = await axios.post("http://localhost:5000/assets/add", updatedAsset);
      console.log("Asset added:", response.data);

      alert("Asset added successfully!");
      setPage("landing");
    } catch (error) {
      console.error("Error adding asset:", error.response?.data || error.message);
      alert("Failed to add asset. Check console for details.");
    }
  };

  return (
    <div className="container">
      <h2>Add Asset</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Asset Name" required onChange={handleChange} />
        <input type="number" name="quantity" placeholder="Quantity" required onChange={handleChange} />
        <input type="date" name="manufactureDate" onChange={handleChange} />
        <select name="status" onChange={handleChange}>
          <option value="working">Working</option>
          <option value="damaged">Damaged</option>
        </select>
        <button type="submit">Submit</button>
      </form>
      <button className="btn-back" onClick={() => setPage("landing")}>Back</button>
    </div>
  );
}

export default AddAsset;
