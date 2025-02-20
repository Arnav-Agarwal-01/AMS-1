// import React from "react";
// import AssetManager from "./components/AssetManager";

// function App() {
//   return <AssetManager />;
// }

// export default App;
import React, { useState } from "react";
import LandingPage from "./components/LandingPage";
import AddAsset from "./components/AddAsset";
import ViewAssets from "./components/ViewAssets.js";

function App() {
  const [page, setPage] = useState("landing");

  return (
    <div>
      {page === "landing" && <LandingPage setPage={setPage} />}
      {page === "add" && <AddAsset setPage={setPage} />}
      {page === "view" && <ViewAssets setPage={setPage} />}
    </div>
  );
}

export default App;
