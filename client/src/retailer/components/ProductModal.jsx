import React from "react";
import { X, MapPin, User, Package, Calendar, Star, ShieldCheck, Mail, Phone, ExternalLink, Video } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

export default function ProductModal({ isOpen, onClose, product }) {
  const handleJitsiConnect = () => {
    // Construct a unique room name using product ID or farmer name
    const roomName = `agrichain-${product?._id || product?.farmerName?.replace(/[^a-zA-Z0-9]/g, '') || Math.random().toString(36).substring(7)}`;
    window.open(`https://meet.jit.si/${roomName}`, "_blank");
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300 mx-4">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Image Section */}
          <div className="md:w-1/2 relative h-64 md:h-auto">
            <img
              src={product.image || "https://images.unsplash.com/photo-1595856467232-613dcee56c12?q=80&w=1200&auto=format&fit=crop"}
              alt={product.name || "Product"}
              className="w-full h-full object-cover"
            />
            {product.isOrganic && (
              <div className="absolute top-4 left-4">
                <Badge className="bg-green-500 hover:bg-green-600 text-white border-0 px-3 py-1 text-sm flex items-center gap-1 shadow-lg">
                  <ShieldCheck className="w-4 h-4" />
                  Organic Certified
                </Badge>
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="md:w-1/2 p-6 md:p-8 flex flex-col">
            <div className="mb-2">
              <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 mb-3">
                {product.category || "Produce"}
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 leading-tight mb-2">
                {product.name}
              </h2>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-3xl font-bold text-emerald-600">
                  {product.price || product.basePrice ? `₹${product.price || product.basePrice}` : "Ask Price"}
                </span>
                {(product.price || product.basePrice) && (
                  <span className="text-gray-500 mb-1">/ {product.unit || (product.type?.toLowerCase() === 'grain' ? 'ton' : 'kg')}</span>
                )}
              </div>
            </div>

            <p className="text-gray-600 mb-6 leading-relaxed">
              {product.description || `High-quality ${product.name} cultivated using sustainable farming practices. Freshly harvested and ready for market delivery.`}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-start gap-3">
                <Package className="w-5 h-5 text-emerald-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">Available Qty</p>
                  <p className="font-semibold text-gray-900">{product.quantity || 0} {product.unit || "kg"}</p>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">Harvest Date</p>
                  <p className="font-semibold text-gray-900">
                    {product.harvestDate ? new Date(product.harvestDate).toLocaleDateString() : 'Recent'}
                  </p>
                </div>
              </div>
            </div>

            {/* Farmer Identity Block */}
            <div className="mt-auto bg-green-50 rounded-xl p-5 border border-green-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-semibold text-green-800 uppercase tracking-wider mb-1">Verified Farmer</p>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-green-600" />
                    {product.farmerName || "Unknown Farmer"}
                  </h3>
                </div>
                <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg shadow-sm border border-green-100">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-bold text-gray-700">{product.farmerRating || "4.8"}</span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-700 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {product.location || "Local District, State"}
                </div>
                {product.farmerPhone && (
                  <div className="flex items-center gap-2 text-gray-700 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {product.farmerPhone}
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-4">
                <Button 
                  onClick={handleJitsiConnect}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md font-semibold flex items-center justify-center"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Connect with Farmer
                </Button>
                <Button variant="outline" className="flex-none text-emerald-700 border-emerald-200 hover:bg-emerald-50">
                  <Mail className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
