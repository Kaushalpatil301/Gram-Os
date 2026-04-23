"use client";

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../product/components/Header.jsx";
import Footer from "../../product/components/Footer.jsx";
import Timeline from "../../product/components/Timeline.jsx";
import Reviews from "../../product/components/Reviews.jsx";
import Notification from "../../product/components/Notification.jsx";
import Chatbot from "../app/Chatbot.jsx";
import {
  timelineData,
  reviewsData,
  getTimelineData,
  getReviewsData,
} from "../../product/lib/data.js";

const API_URL = "http://localhost:8000/api/v1/products";

export default function ConsumerProductPage({ onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();

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

  const handleLogoutWithNotification = () => {
    setNotification("Logged out successfully ✅");
    if (onLogout) onLogout();
  };

  const handleAddToCart = () => {
    setNotification("🛒 Product added to cart!");
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
            onClick={() => navigate("/dashboard/consumer")}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Go to Consumer Dashboard
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
        showBackButton={true}
        title="Consumer Portal"
        subtitle="Product Details & Traceability"
      />

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Main Product Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Product Image and Basic Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Product Image */}
              <div className="relative aspect-video bg-gradient-to-br from-emerald-100 to-green-200 overflow-hidden">
                {currentProduct?.image ? (
                  <img
                    src={currentProduct.image}
                    alt={currentProduct.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-8xl">🌾</span>
                  </div>
                )}
              </div>

              {/* Product Title and Type */}
              <div className="p-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                      {currentProduct?.name}
                    </h1>
                    <p className="text-lg text-gray-600 flex items-center gap-2">
                      <span className="text-2xl">📍</span>
                      {currentProduct?.locality}
                    </p>
                  </div>
                  <span className={`px-4 py-2 rounded-full font-semibold text-sm ${
                    currentProduct?.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {currentProduct?.status === 'active' ? '✓ Fresh' : 'Not Available'}
                  </span>
                </div>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Product Type</p>
                    <p className="text-lg font-bold text-gray-900">{currentProduct?.type}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Available Quantity</p>
                    <p className="text-lg font-bold text-green-600">{currentProduct?.quantity} kg</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quality & Pricing Panel */}
          <div className="space-y-6">
            {/* Freshness Score */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Freshness Score</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-5xl font-bold text-green-600">9.2</span>
                  <span className="text-gray-500">/10</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
              <p className="text-sm text-green-600 font-medium mt-3">Excellent Quality</p>
            </div>

            {/* Listing Date */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Listing Date</p>
              <p className="text-2xl font-bold text-gray-900 mb-2">
                {currentProduct?.createdAt 
                  ? new Date(currentProduct.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })
                  : 'N/A'
                }
              </p>
              <p className="text-xs text-gray-500">
                {currentProduct?.createdAt 
                  ? `Listed ${Math.floor((Date.now() - new Date(currentProduct.createdAt)) / (1000 * 60 * 60))} hours ago`
                  : 'Recently listed'
                }
              </p>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl shadow-lg p-6 border-2 border-emerald-200">
              <p className="text-xs font-semibold text-emerald-700 uppercase mb-3">💰 Price</p>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Per Kilogram</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    ₹{currentProduct?.basePrice}/kg
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex gap-4 flex-wrap">
            <button 
              onClick={handleAddToCart}
              className="flex-1 min-w-[200px] bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
              🛒 Add to Cart
            </button>
            <button className="flex-1 min-w-[200px] bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
              🛍️ Buy Now
            </button>
          </div>
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
