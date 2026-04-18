import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "./index.css"; // if you have



const role = localStorage.getItem("role");
if (role) {
  document.body.className = `role-${role}`;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);