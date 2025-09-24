import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.js"; // add .js extension here
import reportWebVitals from "./reportWebVitals.js"; // add .js extension here

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
