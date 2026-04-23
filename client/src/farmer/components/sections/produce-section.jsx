import { useMemo, useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { Mic, MicOff } from "lucide-react";

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
import { voiceToProduce } from "../../../lib/voiceInput";

const API_URL = "http://localhost:8000/api/v1/products";

export default function ProduceSection({ produce, onAdd, onUpdate, onDelete }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyProduce());
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isListening, setIsListening] = useState(false);

  // QR popup state
  const [qrOpen, setQrOpen] = useState(false);
  const [qrProduct, setQrProduct] = useState(null);

  // Price prediction state
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictingProductId, setPredictingProductId] = useState(null);
  const [predictionOpen, setPredictionOpen] = useState(false);
  const [predictionData, setPredictionData] = useState(null);

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const startAdd = () => {
    setEditing(null);
    setForm(emptyProduce());
    setSelectedImage(null);
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
    setOpen(true);
  };

  const handleFileChange = (e) => {
    setSelectedImage(e.target.files[0]);
  };

  // Voice input handler - FULLY AUTONOMOUS
  const handleVoiceInput = async () => {
    try {
      setIsListening(true);
      toast.info("🎤 Listening... Speak now!", {
        autoClose: 2000,
      });

      const result = await voiceToProduce();
      
      if (result.success && result.data) {
        toast.success(`✅ Heard: "${result.transcript}"`, {
          autoClose: 2000,
        });
        
        // Fill form with voice data (with defaults for missing fields)
        const voiceForm = {
          name: result.data.name || "Unknown Product",
          type: result.data.type || "Other", // Must match enum: "Other" with capital O
          quantity: result.data.quantity || 10,
          basePrice: result.data.basePrice || 50,
          locality: result.data.locality || "Not specified",
        };
        
        setForm(voiceForm);
        
        // Show what we're adding
        toast.info(`📦 Adding: ${voiceForm.name} - ${voiceForm.quantity}kg @ ₹${voiceForm.basePrice}/kg`, {
          autoClose: 2000,
        });
        
        // Automatically save without opening dialog
        await saveProductDirectly(voiceForm);
      }
    } catch (error) {
      console.error("Voice input error:", error);
      toast.error(
        error.message || "Failed to process voice input. Please try again."
      );
    } finally {
      setIsListening(false);
    }
  };

  // Direct save function for autonomous voice input
  const saveProductDirectly = async (formData) => {
    try {
      setIsUploading(true);

      // Check if user data is available
      if (!user || !user.email) {
        toast.error("User information not found. Please login again.");
        console.error("User data missing:", user);
        return;
      }

      // Build FormData for multipart/form-data
      const data = new FormData();
      data.append("name", formData.name.trim());
      data.append("type", formData.type.trim());
      data.append("quantity", Number(formData.quantity));
      data.append("basePrice", Number(formData.basePrice));
      data.append("locality", formData.locality.trim());
      data.append("farmerEmail", user.email);

      // Debug: Log what we're sending
      console.log("🤖 Auto-submitting product:", {
        name: formData.name,
        type: formData.type,
        quantity: formData.quantity,
        basePrice: formData.basePrice,
        locality: formData.locality,
        farmerEmail: user.email,
      });

      // Create new product
      const response = await axios.post(API_URL, data);
      
      toast.success(`🎉 ${formData.name} added successfully!`, {
        autoClose: 3000,
      });

      // Refresh product list
      fetchProducts();
      
      // Reset form
      setForm(emptyProduce());
      
    } catch (error) {
      console.error("Auto-save error:", error);
      console.error("Error response:", error.response?.data);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message;
      toast.error(`❌ Failed to add product: ${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Fetch all products from database (for demo)
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(API_URL);
      setProducts(response.data.data.products || []);
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
      formData.append("name", form.name.trim());
      formData.append("type", form.type.trim());
      formData.append("quantity", Number(form.quantity));
      formData.append("basePrice", Number(form.basePrice));
      formData.append("locality", form.locality.trim());
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

  const handlePredictPrice = async (product) => {
    try {
      setIsPredicting(true);
      setPredictingProductId(product._id);

      const response = await axios.post(
        `${API_URL}/${product._id}/predict-price`,
      );

      if (response.data.success) {
        const { predictedPrice, farmerPrice } = response.data.data;
        const difference = (predictedPrice - farmerPrice).toFixed(2);
        const percentage = (
          ((predictedPrice - farmerPrice) / farmerPrice) *
          100
        ).toFixed(1);

        // Set prediction data and open dialog
        setPredictionData({
          productName: product.name,
          farmerPrice: farmerPrice,
          predictedPrice: predictedPrice,
          difference: difference,
          percentage: percentage,
        });
        setPredictionOpen(true);
      }
    } catch (error) {
      console.error("Prediction error:", error);
      toast.error(
        error.response?.data?.message ||
          "Price prediction failed. Please try again.",
      );
    } finally {
      setIsPredicting(false);
      setPredictingProductId(null);
    }
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
            onClick={handleVoiceInput}
            disabled={isListening}
            className={`${
              isListening
                ? "bg-red-600 hover:bg-red-700 animate-pulse"
                : "bg-blue-600 hover:bg-blue-700"
            } cursor-pointer`}
            title="Add produce with voice"
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4 mr-2" />
                Listening...
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 mr-2" />
                Voice Input
              </>
            )}
          </Button>
          <Button
            onClick={startAdd}
            className="bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
          >
            Add Produce
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Items" value={totalSkus.toString()} />
        <Stat label="Total Quantity" value={`${totalQty} kg`} />
        <Stat
          label="Avg. Base Price"
          value={`₹${avgBase(products).toFixed(2)}`}
        />
        <Stat
          label="Active Products"
          value={`${products.filter((p) => p.status === "active").length}`}
        />
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
                      size="sm"
                      className="cursor-pointer bg-blue-600 text-white hover:bg-blue-700"
                      onClick={() => handlePredictPrice(p)}
                      disabled={isPredicting && predictingProductId === p._id}
                    >
                      {isPredicting && predictingProductId === p._id
                        ? "Predicting..."
                        : "Predict Price"}
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
                            className="bg-blue-600 text-white hover:bg-blue-700"
                            onClick={() => handlePredictPrice(p)}
                            disabled={
                              isPredicting && predictingProductId === p._id
                            }
                          >
                            {isPredicting && predictingProductId === p._id
                              ? "Predicting..."
                              : "Predict Price"}
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

      {/* Price Prediction Dialog */}
      <Dialog open={predictionOpen} onOpenChange={setPredictionOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">
              Price Prediction
            </DialogTitle>
          </DialogHeader>
          {predictionData && (
            <div className="space-y-4 py-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {predictionData.productName}
                </h3>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Your Listed Price:</span>
                  <span className="text-lg font-semibold text-gray-900">
                    ₹{predictionData.farmerPrice}/kg
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">AI Predicted Price:</span>
                  <span className="text-lg font-semibold text-blue-600">
                    ₹{predictionData.predictedPrice}/kg
                  </span>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Difference:</span>
                    <span
                      className={`text-lg font-bold ${
                        predictionData.difference >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {predictionData.difference >= 0 ? "+" : ""}₹
                      {predictionData.difference}
                      <span className="text-sm ml-1">
                        ({predictionData.percentage >= 0 ? "+" : ""}
                        {predictionData.percentage}%)
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 text-center mt-4">
                {predictionData.difference >= 0 ? (
                  <p>💡 Market suggests your price could be higher</p>
                ) : (
                  <p>💡 Consider adjusting your price to match market trends</p>
                )}
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <Button
              onClick={() => setPredictionOpen(false)}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="flex flex-col items-center gap-4">
          <DialogHeader>
            <DialogTitle>Product QR Code</DialogTitle>
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
            <LabeledInput label="Type *">
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({ ...f, type: e.target.value }))
                }
              >
                <option value="">Select type...</option>
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
                value={form.quantity}
                onChange={(e) =>
                  setForm((f) => ({ ...f, quantity: Number(e.target.value) }))
                }
              />
            </LabeledInput>
            <LabeledInput label="Base Price (₹/kg) *">
              <Input
                type="number"
                value={form.basePrice}
                onChange={(e) =>
                  setForm((f) => ({ ...f, basePrice: Number(e.target.value) }))
                }
              />
            </LabeledInput>
            <LabeledInput label="Locality *">
              <Input
                value={form.locality}
                onChange={(e) =>
                  setForm((f) => ({ ...f, locality: e.target.value }))
                }
              />
            </LabeledInput>
            <LabeledInput label="Produce Image">
              <Input type="file" accept="image/*" onChange={handleFileChange} />
            </LabeledInput>
          </div>
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
