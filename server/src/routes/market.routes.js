import { Router } from "express";
import { getRegionalIntelligence } from "../controllers/market.controllers.js";

const router = Router();

router.route("/intelligence").get(getRegionalIntelligence);

export default router;
