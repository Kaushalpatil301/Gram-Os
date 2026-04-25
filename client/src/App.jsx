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
import NotFound from "./components/NotFound.jsx";

// Route guards
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* Landing Page - accessible only to unauthenticated users */}
          <Route path="/" element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          } />

          {/* Auth Page - accessible only to unauthenticated users */}
          <Route path="/auth" element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          } />

          {/* Dashboards - role protected */}
          <Route path="/dashboard/farmer" element={
            <ProtectedRoute allowedRoles={['farmer']}>
              <FarmerPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/retailer" element={
            <ProtectedRoute allowedRoles={['retailer']}>
              <RetailerPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/consumer" element={
            <ProtectedRoute allowedRoles={['consumer']}>
              <ConsumerHomePage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/worker" element={
            <ProtectedRoute allowedRoles={['villager']}>
              <VillagerPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/villager" element={
            <ProtectedRoute allowedRoles={['villager']}>
              <VillagerPage />
            </ProtectedRoute>
          } />

          {/* User-Specific Product Routes */}
          <Route
            path="/consumer/product/:id"
            element={
              <ProtectedRoute allowedRoles={['consumer']}>
                <ConsumerProductPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/retailer/product/:id"
            element={
              <ProtectedRoute allowedRoles={['retailer']}>
                <RetailerProductPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/product/:id"
            element={
              <ProtectedRoute allowedRoles={['farmer']}>
                <FarmerProductPage />
              </ProtectedRoute>
            }
          />

          {/* Generic Product Routes (fallback to consumer) */}
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/product" element={<ProductPage />} />
          <Route path="/track/:batchId" element={<ProductPage />} />

           <Route path="/cnn" element={<CropDetector />} />
           <Route path="/phone" element={<PhoneSimulation />} />

           {/* Catch-all 404 route */}
           <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
