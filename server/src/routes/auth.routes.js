import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  verifyEmail,
  resendVerificationEmail,
  forgotPasswordRequest,
  refreshAccessToken,
  resetForgotPassword,
  changeCurrentPassword,
  updateUserRole,
  getAllFarmers,
} from "../controllers/auth.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/verify-email/:verificationToken").get(verifyEmail);
router.route("/refresh-token").get(refreshAccessToken);
router.route("/forgot-password").post(forgotPasswordRequest);
router.route("/reset-password/:resetToken").post(resetForgotPassword);
router.route("/update-role").patch(updateUserRole);
router.route("/farmers").get(getAllFarmers);

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router
  .route("/resend-verification-email")
  .post(verifyJWT, resendVerificationEmail);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);

export default router;
