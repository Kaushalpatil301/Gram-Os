"use client";

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import ProductDetails from "../components/ProductDetails.jsx";
import Timeline from "../components/Timeline.jsx";
import Reviews from "../components/Reviews.jsx";
import Actions from "../components/Actions.jsx";
import Notification from "../components/Notification.jsx";
import Chatbot from "../../consumer/app/Chatbot.jsx";
import {
  timelineData,
  reviewsData,
  getTimelineData,
  getReviewsData,
} from "../lib/data.js";
import { apiLogout } from "../../lib/api.js";

const API_URL = "http://localhost:8000/api/v1/products";

export default function ProductPage({ onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [showQR, setShowQR] = useState(false);
  const [notification, setNotification] = useState("");
  const [currentProduct, setCurrentProduct] = useState(null);
  const [currentTimeline, setCurrentTimeline] = useState(timelineData);
  const [currentReviews, setCurrentReviews] = useState(reviewsData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (id) {
        try {
          setLoading(true);
          setError(null);
          const response = await axios.get(`${API_URL}/${id}`);
          const product = response.data.data.product;
          setCurrentProduct(product);
          setCurrentTimeline(getTimelineData(product.farmId) || timelineData);
          setCurrentReviews(getReviewsData(product.farmId) || reviewsData);
          setNotification(`✅ Viewing: ${product.name}`);
        } catch (err) {
          console.error("Error fetching product:", err);
          setError("Product not found or failed to load");
          setNotification("❌ Failed to load product");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setNotification("📋 No product selected");
      }
    };

    fetchProduct();
  }, [id]);

  const handleLogoutWithNotification = async () => {
    setNotification("Logged out successfully ✅");
    await apiLogout();
    if (onLogout) onLogout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-green-800 mb-2">
            Loading Product Details
          </h3>
          <p className="text-green-600">Fetching product information...</p>
          {id && (
            <p className="text-sm text-gray-600 mt-3 font-mono bg-white px-3 py-1 rounded-full inline-block">
              ID: {id}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (error || !currentProduct) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-red-600 mb-2">
            {error || "Product not found"}
          </h3>
          <p className="text-gray-600 mb-4">
            Please check the product ID and try again.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50">
      <Header
        onLogout={handleLogoutWithNotification}
        productId={id}
        showBackButton={!!id}
      />

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">
        {/* Product Details */}
        <ProductDetails product={currentProduct} />

        {/* Actions Section */}
        <div id="actions-section" className="pt-4">
          <Actions
            showQR={showQR}
            setShowQR={setShowQR}
            productId={id}
            product={currentProduct}
          />
        </div>

        {/* Timeline + Reviews */}
        <div className="mt-16 space-y-16">
          <div className="border-t border-gray-200 pt-16">
            <Timeline data={currentTimeline} productId={id} />
          </div>

          <div className="border-t border-gray-200 pt-16">
            <Reviews data={currentReviews} productId={id} />
          </div>
        </div>
      </div>
      <Chatbot />
      <Footer />
      <Notification message={notification} />
    </div>
  );
}
