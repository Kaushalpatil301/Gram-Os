import { useMemo, useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { Mic, MicOff, Sparkles } from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Badge } from "../../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "../../../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import { QRCodeSVG } from "qrcode.react";
import { emptyProduce, produceTypes } from "../../lib/data";

const API_URL = "http://localhost:8000/api/v1/products";

const PAST_PRODUCE = [
  { _id: 'past-1', name: 'Wheat (Sharbati)', type: 'Grain', quantity: 1500, basePrice: 25, locality: 'Koregaon, Pune', harvestDate: 'March 2025', image: 'https://images.unsplash.com/photo-1574323347407-285b73641ea5?q=80&w=500&auto=format&fit=crop' },
  { _id: 'past-2', name: 'Sugarcane', type: 'Cash Crop', quantity: 8000, basePrice: 3, locality: 'Koregaon, Pune', harvestDate: 'November 2024', image: 'https://images.unsplash.com/photo-1590499256956-6134b2238c35?q=80&w=500&auto=format&fit=crop' },
  { _id: 'past-3', name: 'Onion', type: 'Vegetable', quantity: 2000, basePrice: 18, locality: 'Koregaon, Pune', harvestDate: 'August 2024', image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?q=80&w=500&auto=format&fit=crop' }
];

export default function ProduceSection({ produce, onAdd, onUpdate, onDelete }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyProduce());
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // QR popup state
  const [qrOpen, setQrOpen] = useState(false);
  const [qrProduct, setQrProduct] = useState(null);

  // Price prediction state
  const [isAiPredictingAdd, setIsAiPredictingAdd] = useState(false);
  const [hasPredictedPrice, setHasPredictedPrice] = useState(false);

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const startAdd = () => {
    setEditing(null);
    
    // Safely extract a string locality from the user object
    let userLocality = "Local";
    if (user.location) {
      if (typeof user.location === "string") {
        userLocality = user.location;
      } else if (typeof user.location === "object") {
        userLocality = user.location.city || user.location.address || user.location.state || "Local";
      }
    } else if (user.village) {
      userLocality = user.village;
    }

    setForm({ ...emptyProduce(), locality: userLocality });
    setSelectedImage(null);
    setHasPredictedPrice(false);
    setOpen(true);
  };

  const startEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name,
      type: p.type,
      quantity: p.quantity,
      basePrice: p.basePrice,
      locality: p.locality,
    });
    setSelectedImage(null);
    setHasPredictedPrice(true);
    setOpen(true);
  };

  const handleFileChange = (e) => {
    setSelectedImage(e.target.files[0]);
  };

  const handlePredictPriceForAdd = async () => {
    if (!form.name || !form.type || !form.quantity) {
      toast.error("Please fill in basic crop details first (Name, Type, Quantity).");
      return;
    }
    setIsAiPredictingAdd(true);
    
    try {
      let imageBase64 = null;
      if (selectedImage) {
        imageBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(selectedImage);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
        });
      }

      const response = await axios.post(`${API_URL}/predict-price-add`, {
        name: form.name,
        type: form.type,
        locality: form.locality || "Local",
        soil: user?.soilType || "",
        imageBase64
      });

      const predicted = response.data?.data?.predictedPrice;
      if (predicted) {
        setForm(f => ({ ...f, basePrice: predicted }));
        setHasPredictedPrice(true);
        toast.success(`AI Predicted an optimal price of ₹${predicted}/kg`);
      } else {
        toast.error("AI couldn't predict the price. Try entering it manually.");
      }
    } catch (error) {
      console.error("AI Prediction Error:", error);
      toast.error(error.response?.data?.message || "Failed to predict price.");
    } finally {
      setIsAiPredictingAdd(false);
    }
  };

  // Fetch all products from database (for demo)
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      if (user && user.email) {
        const response = await axios.get(`${API_URL}/farmer/${user.email}`);
        setProducts(response.data.data.products || []);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (open === false) {
      fetchProducts();
    }
  }, [open]);

  useEffect(() => {
    const handleModal = (e) => {
      if (e.detail?.modal === "add_produce") {
        startAdd();
      }
    };
    const handleProduceAdded = () => {
      fetchProducts();
    };
    window.addEventListener("AGRIBOT_MODAL", handleModal);
    window.addEventListener("AGRIBOT_PRODUCE_ADDED", handleProduceAdded);
    return () => {
      window.removeEventListener("AGRIBOT_MODAL", handleModal);
      window.removeEventListener("AGRIBOT_PRODUCE_ADDED", handleProduceAdded);
    };
  }, []);

  // Save product to database
  const saveProduct = async () => {
    try {
      setIsUploading(true);
      
      // Validate required fields
      if (
        !form.name ||
        !form.type ||
        !form.quantity ||
        !form.basePrice ||
        !form.locality
      ) {
        toast.error("Please fill in all required fields.");
        setIsUploading(false);
        return;
      }

      // Check if user data is available
      if (!user || !user.email) {
        toast.error("User information not found. Please login again.");
        console.error("User data missing:", user);
        setIsUploading(false);
        return;
      }

      // Build FormData for multipart/form-data
      const formData = new FormData();
      formData.append("name", String(form.name).trim());
      formData.append("type", String(form.type).trim());
      formData.append("quantity", Number(form.quantity));
      formData.append("basePrice", Number(form.basePrice));
      
      let locStr = "Local";
      if (typeof form.locality === "string") {
        locStr = form.locality;
      } else if (form.locality && typeof form.locality === "object") {
        locStr = form.locality.city || form.locality.address || form.locality.state || "Local";
      } else if (form.locality) {
        locStr = String(form.locality);
      }
      formData.append("locality", locStr.trim());
      formData.append("farmerEmail", user.email);
      // Note: Don't send farmerId - backend looks it up from email

      // Append image file if selected
      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      // Debug: Log what we're sending
      console.log("Sending product data:", {
        name: form.name,
        type: form.type,
        quantity: Number(form.quantity),
        basePrice: Number(form.basePrice),
        locality: form.locality,
        farmerEmail: user.email,
        hasImage: !!selectedImage
      });

      if (editing) {
        // Update existing product
        const response = await axios.patch(
          `${API_URL}/${editing._id}`,
          formData
        );
        toast.success("Product updated successfully!");
      } else {
        // Create new product
        const response = await axios.post(API_URL, formData);
        toast.success("Product added successfully!");
      }

      setOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Upload error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message;
      toast.error(`Upload failed: ${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  const submit = () => {
    saveProduct();
  };

  // Delete product from database
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      await axios.delete(`${API_URL}/${productId}`);
      toast.success("Product deleted successfully.");
      fetchProducts();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(
        `Delete failed: ${error.response?.data?.message || error.message}`,
      );
    }
  };

  const handleShowQR = (p) => {
    setQrProduct(p);
    setQrOpen(true);
  };

  const totalSkus = products.length;
  const totalQty = useMemo(
    () => products.reduce((sum, p) => sum + Number(p.quantity || 0), 0),
    [products],
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">My Produce</h2>
          <p className="text-muted-foreground">
            Manage your listed items and certificates.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={startAdd}
            className="bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
          >
            Add Produce
          </Button>
        </div>
      </div>


      {/* Views */}
      <Tabs defaultValue="cards" className="mt-6">
        <TabsList className="flex gap-4 bg-emerald-50/50 p-2 rounded-xl">
          <TabsTrigger value="cards">Card View</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
        </TabsList>

        {/* Card View */}
        <TabsContent value="cards" className="mt-6">
          {isLoading ? (
            <div className="text-center py-10 text-gray-500">
              Loading products...
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No products found. Add your first produce!
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <Card key={p._id} className="rounded-2xl shadow-md">
                  <CardHeader>
                    <CardTitle className="flex justify-between">
                      <span>{p.name}</span>
                      <Badge variant="outline">{p.type}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {p.image && (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-32 object-cover rounded-lg border mb-3"
                      />
                    )}
                    <div className="space-y-1 text-sm">
                      <div>
                        <span className="font-medium">Quantity:</span>{" "}
                        {p.quantity} kg
                      </div>
                      <div>
                        <span className="font-medium">Price:</span> ₹
                        {p.basePrice}/kg
                      </div>
                      <div>
                        <span className="font-medium">Locality:</span>{" "}
                        {p.locality}
                      </div>
                      <div>
                        <span className="font-medium">Farm ID:</span> {p.farmId}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-wrap gap-2 justify-between">
                    <Link to={`/farmer/product/${p._id}`}>
                      <Button
                        className="cursor-pointer"
                        size="sm"
                        variant="outline"
                      >
                        View More
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      className="cursor-pointer bg-emerald-600 text-white hover:bg-emerald-700"
                      onClick={() => handleShowQR(p)}
                    >
                      Show QR
                    </Button>
                    <Button
                      className="cursor-pointer"
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteProduct(p._id)}
                    >
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Table View */}
        <TabsContent value="table" className="mt-6">
          <div className="overflow-x-auto border rounded-xl">
            <Table>
              <TableHeader className="bg-emerald-50">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Locality</TableHead>
                  <TableHead>Farm ID</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((p) => (
                    <TableRow key={p._id}>
                      <TableCell>{p.name}</TableCell>
                      <TableCell>{p.type}</TableCell>
                      <TableCell>{p.quantity} kg</TableCell>
                      <TableCell>₹{p.basePrice}/kg</TableCell>
                      <TableCell>{p.locality}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {p.farmId}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link to={`/farmer/product/${p._id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                            >
                              View More
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            className="bg-emerald-600 text-white hover:bg-emerald-700"
                            onClick={() => handleShowQR(p)}
                          >
                            Show QR
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteProduct(p._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Past Produce Section */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          🕒 Past Produce History
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-80">
          {PAST_PRODUCE.map((p) => (
            <Card key={p._id} className="rounded-2xl shadow-sm border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex justify-between items-center text-gray-700">
                  <span>{p.name}</span>
                  <Badge variant="secondary" className="bg-gray-100">{p.type}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-32 object-cover rounded-lg border mb-3 grayscale-[20%]"
                />
                <div className="space-y-1 text-sm text-gray-500">
                  <div>
                    <span className="font-medium text-gray-600">Total Yield:</span> {p.quantity} kg
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Avg. Price Sold:</span> ₹{p.basePrice}/kg
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Harvested:</span> {p.harvestDate}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 rounded-b-2xl py-3 border-t">
                <p className="text-xs text-gray-500 font-semibold w-full text-center">✓ Season Completed</p>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="flex flex-col items-center gap-4">
          <DialogHeader>
            <DialogTitle>Product QR Code</DialogTitle>
            <DialogDescription className="sr-only">Scan this QR code to view the product details.</DialogDescription>
          </DialogHeader>
          {qrProduct && (
            <>
              <QRCodeSVG
                value={`http://localhost:5173/product/${qrProduct._id}`}
                size={220}
                level="H"
                includeMargin
              />
              <p className="text-sm text-gray-600">
                Scan to view {qrProduct.name}
              </p>
            </>
          )}
          <Button
            onClick={() => setQrOpen(false)}
            className="bg-emerald-600 text-white"
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Produce Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Produce" : "Add Produce"}
            </DialogTitle>
            <DialogDescription className="sr-only">Form to add or edit product details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <LabeledInput label="Name *">
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Tomatoes"
              />
            </LabeledInput>
            <LabeledInput label="Crop Category *">
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({ ...f, type: e.target.value }))
                }
              >
                <option value="">Select category...</option>
                {produceTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </LabeledInput>
            <LabeledInput label="Quantity (kg) *">
              <Input
                type="number"
                value={form.quantity || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, quantity: e.target.value === "" ? "" : Number(e.target.value) }))
                }
              />
            </LabeledInput>

            <LabeledInput label="Produce Image">
              <Input type="file" accept="image/*" onChange={handleFileChange} />
            </LabeledInput>

            {!hasPredictedPrice ? (
              <div className="pt-2">
                <Button 
                  onClick={handlePredictPriceForAdd}
                  disabled={isAiPredictingAdd}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold transition-all shadow-md"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isAiPredictingAdd ? "AI is Analyzing Market..." : "Predict Optimal Price"}
                </Button>
              </div>
            ) : (
              <LabeledInput label="Base Price (₹/kg) * (AI Suggested)">
                <Input
                  type="number"
                  value={form.basePrice || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, basePrice: e.target.value === "" ? "" : Number(e.target.value) }))
                  }
                  className="border-purple-300 focus-visible:ring-purple-500 bg-purple-50"
                />
              </LabeledInput>
            )}
          </div>
          {hasPredictedPrice && (
            <div className="cursor-pointer mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-emerald-600 text-white cursor-pointer"
                onClick={submit}
                disabled={isUploading}
              >
                {isUploading
                  ? "Saving..."
                  : editing
                    ? "Save Changes"
                    : "Add Product"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="mt-1 text-xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}

function LabeledInput({ label, children }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-sm">{label}</Label>
      {children}
    </div>
  );
}

function avgBase(list) {
  if (!list.length) return 0;
  return list.reduce((s, p) => s + Number(p.basePrice || 0), 0) / list.length;
}
