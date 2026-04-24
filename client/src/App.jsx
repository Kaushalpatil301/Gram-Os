import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

// Pages
import FarmerPage from "./farmer/app/page.jsx";
import AuthPage from "./auth/app/page.jsx";
import LandingPage from "./landing/page.jsx";
import ProductPage from "./product/app/page.jsx";
import ConsumerProductPage from "./consumer/product/page.jsx";
import RetailerProductPage from "./retailer/product/page.jsx";
import FarmerProductPage from "./farmer/product/page.jsx";
import ConsumerHomePage from "./consumer/app/page.jsx";
import RetailerPage from "./retailer/app/page.jsx";
import CropDetector from "./cnn/page.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import VillagerPage from "./worker/app/page.jsx";
import PhoneSimulation from "./phone/app/page.jsx";

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth Page */}
          <Route path="/auth" element={<AuthPage />} />

          {/* Dashboards */}
          <Route path="/dashboard/farmer" element={<FarmerPage />} />
          <Route path="/dashboard/retailer" element={<RetailerPage />} />
          <Route path="/dashboard/consumer" element={<ConsumerHomePage />} />
          <Route path="/dashboard/worker" element={<VillagerPage />} />
          <Route path="/dashboard/villager" element={<VillagerPage />} />

          {/* User-Specific Product Routes */}
          <Route
            path="/consumer/product/:id"
            element={<ConsumerProductPage />}
          />
          <Route
            path="/retailer/product/:id"
            element={<RetailerProductPage />}
          />
          <Route path="/farmer/product/:id" element={<FarmerProductPage />} />

          {/* Generic Product Routes (fallback to consumer) */}
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/product" element={<ProductPage />} />
          <Route path="/track/:batchId" element={<ProductPage />} />

          <Route path="/cnn" element={<CropDetector />} />
          <Route path="/phone" element={<PhoneSimulation />} />
        </Routes>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
