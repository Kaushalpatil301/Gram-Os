import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import {
  Search,
  MapPin,
  Star,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { filterOptions } from "../lib/data";
import axios from "axios";
import { toast } from "react-toastify";
import { useTranslation } from "../../consumer/i18n/config.jsx";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function Farmers() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduce, setSelectedProduce] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [farmers, setFarmers] = useState([]);
  const [filteredFarmers, setFilteredFarmers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch farmers from database
  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        setIsLoading(true);
        // Fetch all users with role 'farmer'
        const response = await axios.get(`${API_URL}/auth/farmers`);
        const farmersData = response.data.data?.farmers || [];

        // Transform data to match component structure
        const transformedFarmers = farmersData.map((farmer, index) => ({
          id: farmer._id,
          name: farmer.username || `Farmer ${index + 1}`,
          email: farmer.email,
          produce: "Multiple Crops", // Can be enhanced based on products
          location: "India", // Can be enhanced with farmer location data
          rating: (4.5 + Math.random() * 0.5).toFixed(1), // Random rating for now
          trust: Math.floor(85 + Math.random() * 15), // Random trust score
          phone: farmer.phone || "Not provided",
          totalContracts: Math.floor(Math.random() * 30),
          activeContracts: Math.floor(Math.random() * 8),
          verified: farmer.isEmailVerified || false,
        }));

        setFarmers(transformedFarmers);
        setFilteredFarmers(transformedFarmers);
      } catch (error) {
        console.error("Error fetching farmers:", error);
        toast.error(t("farmers.emptyTitle"));
        setFarmers([]);
        setFilteredFarmers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFarmers();
  }, []);

  // Filter farmers based on search and filters
  useEffect(() => {
    let filtered = farmers.filter((farmer) => {
      const matchesSearch =
        farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.produce.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProduce =
        !selectedProduce ||
        selectedProduce === "all" ||
        farmer.produce.toLowerCase().includes(selectedProduce.toLowerCase());
      const matchesLocation =
        !selectedLocation ||
        selectedLocation === "all" ||
        farmer.location.toLowerCase() === selectedLocation.toLowerCase();

      return matchesSearch && matchesProduce && matchesLocation;
    });
    setFilteredFarmers(filtered);
  }, [searchTerm, selectedProduce, selectedLocation, farmers]);

  const handleConnectFarmer = (farmer) => {
    // Simple feedback without modal
    console.log(`Connected to ${farmer.name}`);
  };

  const handleSendMessage = (farmer) => {
    console.log(`Message sent to ${farmer.name}`);
  };

  const handleCall = (farmer) => {
    console.log(`Calling ${farmer.name}`);
  };

  return (
    <>
      {/* Filter Controls */}
      <Card className="mb-8 border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={t("farmers.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 h-12 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Produce Filter */}
            <Select onValueChange={setSelectedProduce} value={selectedProduce}>
              <SelectTrigger className="lg:w-56 h-12 border-gray-200">
                <SelectValue placeholder={t("farmers.allProduceTypes")} />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.produceTypes.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {t(option.label)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Location Filter */}
            <Select
              onValueChange={setSelectedLocation}
              value={selectedLocation}
            >
              <SelectTrigger className="lg:w-56 h-12 border-gray-200">
                <SelectValue placeholder={t("farmers.allLocations")} />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.locations.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {t(option.label)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results Counter */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 bg-gray-50 inline-block px-4 py-2 rounded-full">
              {t("farmers.showing", {
                filtered: filteredFarmers.length,
                total: farmers.length,
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t("farmers.loading")}</p>
        </div>
      )}

      {/* Farmers Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredFarmers.map((farmer) => (
            <Card
              key={farmer.id}
              className="border-0 shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                {/* Header */}
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {farmer.name}
                    </h3>
                    {farmer.verified && (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-gray-600">{farmer.produce}</p>
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">{farmer.location}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                      <span className="text-sm font-medium">
                        {farmer.rating}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">
                        {t("farmers.trustScore")}
                      </div>
                      <div className="text-sm font-semibold text-green-600">
                        {farmer.trust}%
                      </div>
                    </div>
                  </div>

                  {/* Trust Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${farmer.trust}%` }}
                    ></div>
                  </div>

                  {/* Contract Stats */}
                  <div className="flex justify-between text-xs text-gray-600 py-2 px-3 bg-gray-50 rounded-lg">
                    <span>
                      {t("farmers.total", { count: farmer.totalContracts })}
                    </span>
                    <span>
                      {t("farmers.active", { count: farmer.activeContracts })}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      className="flex-1 h-9"
                      variant="outline"
                      onClick={() => handleConnectFarmer(farmer)}
                    >
                      {t("common.connect")}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-9 h-9 p-0"
                      onClick={() => handleCall(farmer)}
                    >
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-9 h-9 p-0"
                      onClick={() => handleSendMessage(farmer)}
                    >
                      <Mail className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredFarmers.length === 0 && (
        <div className="text-center py-16">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            {t("farmers.emptyTitle")}
          </h3>
          <p className="text-gray-500">{t("farmers.emptyDesc")}</p>
        </div>
      )}
    </>
  );
}
