import React, { useState } from "react";
import { useTranslation } from "../../consumer/i18n/config.jsx";

export default function ProductDetails({ product, hideFarmerDetails = false }) {
  const { t } = useTranslation();
  const [isImageLoading, setIsImageLoading] = useState(true);

  if (!product) {
    return (
      <div className="p-8 text-center text-gray-500 flex flex-col items-center">
        <span>{t("product.details.noData")}</span>
      </div>
    );
  }

  const { name, type, quantity, basePrice, locality, image, farmId, farmerEmail, status, createdAt } = product;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start p-6">
      {/* Left: Product Image */}
      <div className="relative aspect-square rounded-3xl overflow-hidden shadow-xl bg-white">
        {isImageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {image ? (
          <img
            src={image}
            className={`w-full h-full object-cover transition-all duration-700 ${
              isImageLoading ? "opacity-0" : "opacity-100"
            }`}
            onLoad={() => setIsImageLoading(false)}
            onError={() => setIsImageLoading(false)}
            alt={name}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-green-200">
            <span className="text-6xl">🌾</span>
          </div>
        )}
      </div>

      {/* Right: Product Details */}
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              status === 'active' ? 'bg-green-100 text-green-800' : 
              status === 'sold' ? 'bg-gray-100 text-gray-800' : 
              'bg-yellow-100 text-yellow-800'
            }`}>
              {status || t("status.active")}
            </span>
          </div>
          <div className="flex items-center text-gray-600">
            <svg
              className="w-4 h-4 mr-2 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
            </svg>
            <span className="font-medium">{locality}</span>
          </div>
        </div>

        {/* Product Info */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-blue-50 px-4 py-3 border-b">
            <h3 className="text-sm font-bold text-blue-800">{t("product.details.productInformation")}</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 uppercase">{t("product.details.type")}</label>
                <p className="font-semibold text-gray-800">{type}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase">{t("product.details.farmId")}</label>
                <p className="font-mono text-sm text-gray-700">{farmId}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase">{t("product.details.quantity")}</label>
                <p className="font-bold text-lg text-emerald-600">{quantity} kg</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase">{t("product.details.basePrice")}</label>
                <p className="font-bold text-lg text-emerald-600">₹{basePrice}/kg</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-emerald-50 px-4 py-3 border-b">
            <h3 className="text-sm font-bold text-emerald-800">{t("product.details.pricingDetails")}</h3>
          </div>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">{t("product.details.unitPrice")}</span>
              <span className="font-semibold">₹{basePrice}/kg</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">{t("product.details.availableQuantity")}</span>
              <span className="font-semibold">{quantity} kg</span>
            </div>
            <div className="border-t pt-4 flex justify-between items-center">
              <span className="text-gray-800 font-semibold">{t("product.details.totalValue")}</span>
              <span className="text-2xl font-bold text-emerald-600">₹{(basePrice * quantity).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Farmer Info */}
        {!hideFarmerDetails && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-purple-50 px-4 py-3 border-b flex items-center">
              <svg className="w-4 h-4 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h3 className="text-sm font-bold text-purple-800">{t("product.details.farmerDetails")}</h3>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-semibold">{farmerEmail?.[0]?.toUpperCase() || 'F'}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">{farmerEmail || t("product.details.unknownFarmer")}</p>
                  <p className="text-sm text-gray-500">
                    {t("product.details.listedOn", {
                      date: createdAt ? new Date(createdAt).toLocaleDateString() : t("retailer.product.na"),
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
