import { Router } from "express";
import {
  getInventoryForecast,
  getInventoryLevels,
  getWasteAnalysis,
  getInventoryInsights,
  getInventoryAlerts
} from "../controllers/inventory.controllers.js";

const router = Router();

// Inventory forecasting and analytics routes
router.route("/retailer/:retailerEmail/forecast").get(getInventoryForecast);
router.route("/retailer/:retailerEmail/levels").get(getInventoryLevels);
router.route("/retailer/:retailerEmail/waste-analysis").get(getWasteAnalysis);
router.route("/retailer/:retailerEmail/insights").get(getInventoryInsights);
router.route("/retailer/:retailerEmail/alerts").get(getInventoryAlerts);

export default router;
