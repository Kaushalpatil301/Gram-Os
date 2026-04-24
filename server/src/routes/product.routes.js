import { Router } from "express";
import {
  createProduct,
  getAllProducts,
  getProductsByFarmer,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductStats,
  predictPrice,
  predictPriceForAdd,
  analyzeProfit,
} from "../controllers/product.controllers.js";
import { upload } from "../utils/cloudinary.js";

const router = Router();

router.route("/farmer/:email").get(getProductsByFarmer);
router.route("/farmer/:email/stats").get(getProductStats);

router.route("/").get(getAllProducts);
router.route("/").post(upload.single("image"), createProduct);
router.route("/:id").get(getProductById);
router.route("/:id").patch(upload.single("image"), updateProduct);
router.route("/:id").delete(deleteProduct);

// Price prediction route
router.route("/:id/predict-price").post(predictPrice);
router.route("/predict-price-add").post(predictPriceForAdd);

// AI Profit Analysis Route
router.route("/:id/analyze-profit").post(analyzeProfit);

export default router;
