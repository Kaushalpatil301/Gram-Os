import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import {SocketProvider } from "./contexts/socketContext.jsx";



createRoot(document.getElementById("root")).render(
  <SocketProvider>
    <App />
  </SocketProvider>
);

import { registerSW } from "virtual:pwa-register";
registerSW();
