import React from "react";
import "./styles.css";

function LandingPage({ setPage }) {
  return (
    <div className="container">
      <h1>Asset Management System</h1>
      <button className="btn" onClick={() => setPage("add")}>Add Item</button>
      <button className="btn" onClick={() => setPage("view")}>View Items</button>
    </div>
  );
}

export default LandingPage;
