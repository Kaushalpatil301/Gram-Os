import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createOrder, verifyPayment } from "../controllers/marketplace.controllers.js";

const router = Router();

// router.use(verifyJWT); // Applying verifyJWT middleware to all routes in this file if needed

router.route("/create-order").post(createOrder);
router.route("/verify-payment").post(verifyPayment);

export default router;
