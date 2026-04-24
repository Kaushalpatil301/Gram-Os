import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import Razorpay from "razorpay";
import crypto from "crypto";

const createOrder = asyncHandler(async (req, res) => {
    const { amount, currency = "INR" } = req.body;

    if (!amount) {
        throw new ApiError(400, "Amount is required");
    }

    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
        amount: Math.round(amount * 100), // convert to paise
        currency,
        receipt: "receipt_" + Date.now(),
    };

    try {
        const order = await razorpay.orders.create(options);
        return res.status(200).json(
            new ApiResponse(200, order, "Order created successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Failed to create order: " + error.message);
    }
});

const verifyPayment = asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        throw new ApiError(400, "Payment verification details missing");
    }

    const sha = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = sha.digest("hex");

    if (digest !== razorpay_signature) {
        throw new ApiError(400, "Transaction not legitimate!");
    }

    return res.status(200).json(
        new ApiResponse(200, { orderId: razorpay_order_id, paymentId: razorpay_payment_id }, "Payment successful")
    );
});

export {
    createOrder,
    verifyPayment
};
