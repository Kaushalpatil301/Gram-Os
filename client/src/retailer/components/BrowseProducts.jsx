import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  MapPin,
  Leaf,
  TrendingUp,
  Package,
  ChevronRight,
  User,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import ProductModal from "./ProductModal";

const API_URL = "http://localhost:8000/api/v1/products";

// High-quality mock data to ensure the marketplace always looks populated and premium
const mockProducts = [
  {
    _id: "mock1",
    name: "Premium Sona Masuri Rice",
    category: "Grains",
    price: 45,
    unit: "kg",
    quantity: 500,
    location: "Raichur, Karnataka",
    farmerName: "Anand Gowda",
    farmerRating: "4.9",
    isOrganic: false,
    image:
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=800&auto=format&fit=crop",
    description:
      "Export quality Sona Masuri rice, aged for 12 months for perfect aroma and texture. Directly sourced from the paddy fields of Raichur.",
    harvestDate: "2023-11-15T00:00:00.000Z",
  },
  {
    _id: "mock2",
    name: "Organic Alphonso Mangoes",
    category: "Fruits",
    price: 850,
    unit: "dozen",
    quantity: 120,
    location: "Ratnagiri, Maharashtra",
    farmerName: "Sanjay Desai",
    farmerRating: "5.0",
    isOrganic: true,
    image:
      "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?q=80&w=800&auto=format&fit=crop",
    description:
      "GI-tagged authentic Ratnagiri Alphonso mangoes. Farm-ripened, completely chemical-free and extremely sweet.",
    harvestDate: "2024-04-05T00:00:00.000Z",
  },
  {
    _id: "mock3",
    name: "Fresh Red Onions",
    category: "Vegetables",
    price: 22,
    unit: "kg",
    quantity: 2000,
    location: "Nashik, Maharashtra",
    farmerName: "Prakash Patil",
    farmerRating: "4.7",
    isOrganic: false,
    image:
      "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?q=80&w=800&auto=format&fit=crop",
    description:
      "A-grade Nashik red onions with low moisture content, ideal for long storage. Excellent pungency and color.",
    harvestDate: "2024-03-20T00:00:00.000Z",
  },
  {
    _id: "mock4",
    name: "Organically Grown Tomatoes",
    category: "Vegetables",
    price: 35,
    unit: "kg",
    quantity: 300,
    location: "Kolar, Karnataka",
    farmerName: "Lakshmi Reddy",
    farmerRating: "4.8",
    isOrganic: true,
    image:
      "https://images.unsplash.com/photo-1592924357228-91a4daadc23f?q=80&w=800&auto=format&fit=crop",
    description:
      "Deep red, juicy tomatoes grown without synthetic pesticides. Perfect for purees, sauces and everyday cooking.",
    harvestDate: "2024-04-08T00:00:00.000Z",
  },
  {
    _id: "mock5",
    name: "Premium Wheat (Sharbati)",
    category: "Grains",
    price: 38,
    unit: "kg",
    quantity: 1500,
    location: "Sehore, Madhya Pradesh",
    farmerName: "Rajendra Singh",
    farmerRating: "4.9",
    isOrganic: false,
    image:
      "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=800&auto=format&fit=crop",
    description:
      "Famous Sehore Sharbati wheat. Golden grains, high protein content, yielding the softest rotis.",
    harvestDate: "2024-03-10T00:00:00.000Z",
  },
  {
    _id: "mock6",
    name: "Pomegranate (Bhagwa)",
    category: "Fruits",
    price: 140,
    unit: "kg",
    quantity: 450,
    location: "Solapur, Maharashtra",
    farmerName: "Dattatray Kale",
    farmerRating: "4.6",
    isOrganic: true,
    image:
      "https://images.unsplash.com/photo-1615485458023-e28e3295988e?q=80&w=800&auto=format&fit=crop",
    description:
      "Export quality Bhagwa variety pomegranates. Deep red arils, soft seeds, and very high juice content.",
    harvestDate: "2024-04-02T00:00:00.000Z",
  },
];

const categories = ["All", "Vegetables", "Fruits", "Grains"];

export default function BrowseProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Attempt to fetch real products from backend
        const response = await axios.get(API_URL);
        const backendProducts = response.data.data?.products || [];

        // Merge real products with our premium mock data
        // We prepend backend products so they show up first
        setProducts([...backendProducts, ...mockProducts]);
      } catch (err) {
        console.error(
          "Error fetching products, falling back to mock data:",
          err,
        );
        // Fallback to purely mock data
        setProducts(mockProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter logic
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.farmerName?.toLowerCase().includes(searchQuery.toLowerCase());

    // Basic category matching. This could be more sophisticated based on actual backend data structures
    const matchesCategory =
      activeCategory === "All" ||
      product.category?.toLowerCase() === activeCategory.toLowerCase() ||
      (product.type &&
        product.type.toLowerCase() === activeCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-12 border border-green-100">
      <div className="p-6 md:p-8">
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by crop, farmer, or location..."
              className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm transition-all bg-gray-50 hover:bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex bg-gray-50 p-1 rounded-xl w-full md:w-auto overflow-x-auto hide-scrollbar">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`py-2 px-6 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                  activeCategory === category
                    ? "bg-white text-emerald-700 shadow-sm border border-gray-200"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full mb-4"></div>
            <p className="text-gray-500 font-medium">
              Loading fresh produce marketplace...
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
            <Leaf className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No products found
            </h3>
            <p className="text-gray-500">
              We couldn't find any produce matching your current filters.
            </p>
            <Button
              variant="outline"
              className="mt-4 border-emerald-200 text-emerald-700"
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("All");
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product._id || Math.random().toString()}
                className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full"
              >
                {/* Image & Badges */}
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <img
                    src={
                      product.image &&
                      typeof product.image === "string" &&
                      product.image.startsWith("http")
                        ? product.image
                        : "https://images.unsplash.com/photo-1595856467232-613dcee56c12?q=80&w=600&auto=format&fit=crop"
                    }
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {product.isOrganic && (
                    <div className="absolute top-3 left-3 bg-green-500/90 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                      ORGANIC
                    </div>
                  )}
                  <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded text-xs font-semibold text-gray-800 shadow-sm flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-600" />
                    High Demand
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1 border-t border-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2">
                      {product.name}
                    </h3>
                  </div>

                  <div className="flex items-end gap-1 mb-4">
                    <span className="text-2xl font-black text-emerald-600">
                      {product.price || product.basePrice
                        ? `₹${product.price || product.basePrice}`
                        : "Ask Price"}
                    </span>
                    {(product.price || product.basePrice) && (
                      <span className="text-gray-500 text-sm mb-1 font-medium">
                        /{product.unit || "ton"}
                      </span>
                    )}
                  </div>

                  {/* Metadata tags */}
                  <div className="space-y-2 mb-5 mt-auto">
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-0 text-xs py-0.5"
                      >
                        <Package className="w-3 h-3 mr-1 inline" />
                        {product.quantity || 0} {product.unit || "kg"} Available
                      </Badge>
                    </div>

                    <div className="flex items-center text-xs text-gray-600 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 mr-1.5" />
                      <span className="truncate">
                        {product.location || product.locality || "Local Source"}
                      </span>
                    </div>
                  </div>

                  {/* Footer (Farmer & CTA) */}
                  <div className="pt-4 border-t border-gray-100 flex flex-col gap-3 mt-auto">
                    <div className="flex items-center gap-2 w-full">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 truncate">
                        {product.farmerName ||
                          product.farmerEmail ||
                          `${product.type || "Verified"} Farmer`}
                      </span>
                    </div>

                    <div className="flex gap-2 w-full mt-2">
                      <Button
                        onClick={() => handleOpenModal(product)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl py-6 transition-all shadow-md text-sm"
                      >
                        Batch Details
                      </Button>
                      <Button
                        onClick={() =>
                          navigate(`/retailer/product/${product._id}`)
                        }
                        className="flex-1 bg-white border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-semibold rounded-xl py-6 transition-all shadow-sm text-sm"
                      >
                        View More
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Overlay */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
      />
    </div>
  );
}
