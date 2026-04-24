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
import { useTranslation } from "../../../consumer/i18n/config.jsx";

const API_URL = "http://localhost:8000/api/v1/products";

const PAST_PRODUCE = [
  { _id: 'past-1', name: 'Wheat (Sharbati)', type: 'Grain', quantity: 1500, basePrice: 25, locality: 'Koregaon, Pune', harvestDate: 'March 2025', image: 'https://images.unsplash.com/photo-1574323347407-285b73641ea5?q=80&w=500&auto=format&fit=crop' },
  { _id: 'past-2', name: 'Sugarcane', type: 'Cash Crop', quantity: 8000, basePrice: 3, locality: 'Koregaon, Pune', harvestDate: 'November 2024', image: 'https://images.unsplash.com/photo-1590499256956-6134b2238c35?q=80&w=500&auto=format&fit=crop' },
  { _id: 'past-3', name: 'Onion', type: 'Vegetable', quantity: 2000, basePrice: 18, locality: 'Koregaon, Pune', harvestDate: 'August 2024', image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?q=80&w=500&auto=format&fit=crop' }
];

export default function ProduceSection({ produce, onAdd, onUpdate, onDelete }) {
  const { t } = useTranslation();
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
    let userLocality = t("produce.form.defaultLocality");
    if (user.location) {
      if (typeof user.location === "string") {
        userLocality = user.location;
      } else if (typeof user.location === "object") {
        userLocality = user.location.city || user.location.address || user.location.state || t("produce.form.defaultLocality");
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
      toast.error(t("produce.toast.fillBasic"));
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
        toast.success(t("produce.toast.aiPredicted", { price: predicted }));
      } else {
        toast.error(t("produce.toast.aiFailedManual"));
      }
    } catch (error) {
      console.error("AI Prediction Error:", error);
      toast.error(error.response?.data?.message || t("produce.toast.predictFailed"));
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
      toast.error(t("produce.toast.loadFailed"));
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
        toast.error(t("produce.toast.fillRequired"));
        setIsUploading(false);
        return;
      }

      // Check if user data is available
      if (!user || !user.email) {
        toast.error(t("produce.toast.userNotFound"));
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
      
       let locStr = t("produce.form.defaultLocality");
       if (typeof form.locality === "string") {
         locStr = form.locality;
       } else if (form.locality && typeof form.locality === "object") {
         locStr = form.locality.city || form.locality.address || form.locality.state || t("produce.form.defaultLocality");
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
        toast.success(t("produce.toast.updated"));
      } else {
        // Create new product
        const response = await axios.post(API_URL, formData);
        toast.success(t("produce.toast.added"));
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
      toast.error(t("produce.toast.uploadFailed", { message: errorMessage }));
    } finally {
      setIsUploading(false);
    }
  };

  const submit = () => {
    saveProduct();
  };

  // Delete product from database
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm(t("produce.confirmDelete")))
      return;

    try {
      await axios.delete(`${API_URL}/${productId}`);
      toast.success(t("produce.toast.deleted"));
      fetchProducts();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(
        `${t("produce.toast.deleteFailed")} ${error.response?.data?.message || error.message}`,
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
          <h2 className="text-2xl font-bold">{t("produce.title")}</h2>
          <p className="text-muted-foreground">
            {t("produce.subtitle")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={startAdd}
            className="bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
          >
            {t("produce.add")}
          </Button>
        </div>
      </div>


      {/* Views */}
      <Tabs defaultValue="cards" className="mt-6">
        <TabsList className="flex gap-4 bg-emerald-50/50 p-2 rounded-xl">
          <TabsTrigger value="cards">{t("produce.view.cards")}</TabsTrigger>
          <TabsTrigger value="table">{t("produce.view.table")}</TabsTrigger>
        </TabsList>

        {/* Card View */}
        <TabsContent value="cards" className="mt-6">
          {isLoading ? (
            <div className="text-center py-10 text-gray-500">
              {t("produce.loadingProducts")}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              {t("produce.emptyCards")}
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
                        <span className="font-medium">{t("produce.field.quantity")}:</span>{" "}
                        {p.quantity} {t("common.units.kg")}
                      </div>
                      <div>
                        <span className="font-medium">{t("produce.field.price")}:</span> {t("common.currency.rupee")}{p.basePrice}/{t("common.units.kg")}
                      </div>
                      <div>
                        <span className="font-medium">{t("produce.field.locality")}:</span>{" "}
                        {p.locality}
                      </div>
                      <div>
                        <span className="font-medium">{t("produce.field.farmId")}:</span> {p.farmId}
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
                        {t("produce.action.viewMore")}
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      className="cursor-pointer bg-emerald-600 text-white hover:bg-emerald-700"
                      onClick={() => handleShowQR(p)}
                    >
                      {t("produce.action.showQr")}
                    </Button>
                    <Button
                      className="cursor-pointer"
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteProduct(p._id)}
                    >
                      {t("produce.action.delete")}
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
                  <TableHead>{t("produce.field.name")}</TableHead>
                  <TableHead>{t("produce.field.type")}</TableHead>
                  <TableHead>{t("produce.field.quantity")}</TableHead>
                  <TableHead>{t("produce.field.price")}</TableHead>
                  <TableHead>{t("produce.field.locality")}</TableHead>
                  <TableHead>{t("produce.field.farmId")}</TableHead>
                  <TableHead className="text-right">{t("produce.field.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      {t("common.loading")}
                    </TableCell>
                  </TableRow>
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      {t("produce.emptyTable")}
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((p) => (
                    <TableRow key={p._id}>
                      <TableCell>{p.name}</TableCell>
                       <TableCell>{p.type}</TableCell>
                       <TableCell>{p.quantity} {t("common.units.kg")}</TableCell>
                       <TableCell>{t("common.currency.rupee")}{p.basePrice}/{t("common.units.kg")}</TableCell>
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
                              {t("produce.action.viewMore")}
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            className="bg-emerald-600 text-white hover:bg-emerald-700"
                            onClick={() => handleShowQR(p)}
                          >
                            {t("produce.action.showQr")}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteProduct(p._id)}
                          >
                            {t("produce.action.delete")}
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
          🕒 {t("produce.pastHistory")}
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
                     <span className="font-medium text-gray-600">{t("produce.past.totalYield")}:</span> {p.quantity} {t("common.units.kg")}
                   </div>
                   <div>
                     <span className="font-medium text-gray-600">{t("produce.past.avgPrice")}:</span> {t("common.currency.rupee")}{p.basePrice}/{t("common.units.kg")}
                   </div>
                  <div>
                    <span className="font-medium text-gray-600">{t("produce.past.harvested")}:</span> {p.harvestDate}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 rounded-b-2xl py-3 border-t">
                <p className="text-xs text-gray-500 font-semibold w-full text-center">✓ {t("produce.past.seasonCompleted")}</p>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="flex flex-col items-center gap-4">
          <DialogHeader>
            <DialogTitle>{t("produce.qr.title")}</DialogTitle>
            <DialogDescription className="sr-only">{t("produce.qr.description")}</DialogDescription>
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
                {t("produce.qr.scanToView", { name: qrProduct.name })}
              </p>
            </>
          )}
          <Button
            onClick={() => setQrOpen(false)}
            className="bg-emerald-600 text-white"
          >
            {t("common.close")}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Produce Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? t("produce.dialog.editTitle") : t("produce.dialog.addTitle")}
            </DialogTitle>
            <DialogDescription className="sr-only">{t("produce.dialog.description")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <LabeledInput label={t("produce.field.nameRequired")}>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder={t("produce.placeholder.tomatoes")}
              />
            </LabeledInput>
            <LabeledInput label={t("produce.field.cropCategoryRequired")}>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={form.type}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, type: e.target.value }))
                  }
                >
                  <option value="">{t("produce.placeholder.selectCategory")}</option>
                  {produceTypes.map((type) => (
                    <option key={type} value={type}>
                      {t("produce.types." + type.toLowerCase().replace(/\s+/g, ""))}
                    </option>
                  ))}
                </select>
            </LabeledInput>
            <LabeledInput label={t("produce.field.quantityLabel")}>
              <Input
                type="number"
                value={form.quantity || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, quantity: e.target.value === "" ? "" : Number(e.target.value) }))
                }
              />
            </LabeledInput>

            <LabeledInput label={t("produce.label.produceImage")}>
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
                  {isAiPredictingAdd ? t("produce.button.aiAnalyzing") : t("produce.button.predictPrice")}
                </Button>
              </div>
            ) : (
              <LabeledInput label={t("produce.field.basePriceLabel")}>
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
                {t("common.cancel")}
              </Button>
              <Button
                className="bg-emerald-600 text-white cursor-pointer"
                onClick={submit}
                disabled={isUploading}
              >
                {isUploading
                  ? t("common.button.saving")
                  : editing
                    ? t("common.button.saveChanges")
                    : t("produce.button.addProduct")}
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
