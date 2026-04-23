/**
 * RazorpayPayment.jsx — GramOS Global Payment Component
 *
 * USAGE EXAMPLES:
 *
 * 1. Input purchase (Input Marketplace):
 *    <RazorpayPayment
 *      amount={1200}
 *      purpose="Input Purchase"
 *      description="Fertilizer × 2 bags — AgroMart"
 *      buyerName={villagerProfile.name}
 *      buyerContact={villagerProfile.phone}
 *      onSuccess={(paymentId) => handleInputPurchase(paymentId)}
 *    />
 *
 * 2. Academy course unlock:
 *    <RazorpayPayment
 *      amount={99}
 *      purpose="Course Unlock"
 *      description="Drip Irrigation Module — Academy"
 *      buyerName={villagerProfile.name}
 *      buyerContact={villagerProfile.phone}
 *      onSuccess={(paymentId) => unlockModule(moduleId, paymentId)}
 *      variant="compact"
 *    />
 *
 * 3. NPTEL course enrollment:
 *    <RazorpayPayment
 *      amount={500}
 *      purpose="NPTEL Enrollment"
 *      description="Sustainable Agriculture — NPTEL"
 *      buyerName={villagerProfile.name}
 *      buyerContact={villagerProfile.phone}
 *      onSuccess={(paymentId) => enrollCourse(courseId, paymentId)}
 *      variant="inline"
 *    />
 *
 * PROPS:
 *   amount        — number   — Amount in INR (integer, e.g. 1200 = ₹1200)
 *   purpose       — string   — Short label shown on button & modal header
 *   description   — string   — Item/order description shown in modal
 *   buyerName     — string   — Pre-filled name in Razorpay checkout
 *   buyerContact  — string   — Pre-filled phone (10-digit) in Razorpay checkout
 *   buyerEmail    — string   — Optional email (defaults to placeholder)
 *   onSuccess     — fn(paymentId, orderId, signature) — Called on successful payment
 *   onFailure     — fn(error) — Called on payment failure/dismissal (optional)
 *   variant       — "default" | "compact" | "inline" — Button style
 *   disabled      — boolean  — Disable button
 *   className     — string   — Extra Tailwind classes on wrapper
 *
 * SETUP (do once in index.html or main entry):
 *   <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
 *
 * ENV VAR (in .env):
 *   VITE_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
 *
 * BACKEND REQUIREMENT:
 *   You need a /api/create-order endpoint that creates a Razorpay order and
 *   returns { orderId, amount, currency }. See the mock below for shape.
 *   In production replace mockCreateOrder() with a real fetch() call.
 */

import { useState, useCallback } from "react";

// ─── Razorpay Key — set in your .env ──────────────────────────────────────────
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID ?? "rzp_test_REPLACE_ME";

// ─── Mock order creator — REPLACE with real backend call ─────────────────────
// Your backend should call Razorpay Orders API and return { orderId, amount, currency }
async function mockCreateOrder(amountInRupees) {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 400));
  return {
    // In production: the order_id returned by Razorpay Orders API
    orderId: `order_mock_${Date.now()}`,
    amount: amountInRupees * 100, // Razorpay expects paise
    currency: "INR",
  };
  /*
  REAL IMPLEMENTATION:
  const res = await fetch("/api/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount: amountInRupees }),
  });
  return res.json(); // { orderId, amount, currency }
  */
}

// ─── Payment Status Modal ─────────────────────────────────────────────────────
function PaymentModal({ status, amount, purpose, description, paymentId, errorMsg, onClose }) {
  if (!status) return null;

  const isSuccess = status === "success";
  const isLoading = status === "loading";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Top accent bar */}
        <div
          className={`h-1.5 w-full ${
            isLoading ? "bg-amber-400" : isSuccess ? "bg-emerald-500" : "bg-red-500"
          }`}
        />

        <div className="p-6">
          {/* Loading state */}
          {isLoading && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-14 h-14 rounded-full border-4 border-emerald-100 border-t-emerald-500 animate-spin" />
              <p className="text-sm font-medium text-gray-600 font-['DM_Sans']">
                Opening secure payment…
              </p>
            </div>
          )}

          {/* Success state */}
          {isSuccess && (
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900 font-['DM_Sans']">Payment Successful</p>
                <p className="text-sm text-gray-500 mt-1">{description}</p>
              </div>
              <div className="w-full bg-emerald-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-['DM_Sans']">Amount Paid</span>
                  <span className="font-bold text-emerald-700 font-['DM_Sans']">₹{amount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-['DM_Sans']">Payment ID</span>
                  <span className="font-mono text-xs text-gray-600 truncate max-w-[140px]">{paymentId}</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-semibold rounded-xl transition-all duration-150 font-['DM_Sans'] text-sm"
              >
                Done
              </button>
            </div>
          )}

          {/* Failure state */}
          {status === "failed" && (
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900 font-['DM_Sans']">Payment Failed</p>
                <p className="text-sm text-gray-500 mt-1">{errorMsg ?? "Something went wrong. Please try again."}</p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 bg-red-500 hover:bg-red-600 active:scale-95 text-white font-semibold rounded-xl transition-all duration-150 font-['DM_Sans'] text-sm"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RazorpayPayment({
  amount,
  purpose = "Payment",
  description = "",
  buyerName = "",
  buyerContact = "",
  buyerEmail = "user@gramos.in",
  onSuccess,
  onFailure,
  variant = "default",    // "default" | "compact" | "inline"
  disabled = false,
  className = "",
}) {
  const [modalStatus, setModalStatus] = useState(null); // null | "loading" | "success" | "failed"
  const [paymentId, setPaymentId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handlePay = useCallback(async () => {
    if (disabled) return;

    // 1. Show loading modal while creating order
    setModalStatus("loading");

    let order;
    try {
      order = await mockCreateOrder(amount);
    } catch (err) {
      setErrorMsg("Could not connect to payment server.");
      setModalStatus("failed");
      onFailure?.(err);
      return;
    }

    // 2. Ensure Razorpay script is loaded
    if (!window.Razorpay) {
      setErrorMsg("Payment gateway not loaded. Check your internet connection.");
      setModalStatus("failed");
      return;
    }

    // 3. Configure Razorpay checkout
    const options = {
      key: RAZORPAY_KEY_ID,
      amount: order.amount,           // in paise
      currency: order.currency ?? "INR",
      name: "GramOS",
      description: description || purpose,
      order_id: order.orderId,
      prefill: {
        name: buyerName,
        contact: buyerContact,
        email: buyerEmail,
      },
      theme: {
        color: "#10b981",             // emerald-500 — matches GramOS palette
        backdrop_color: "rgba(0,0,0,0.6)",
      },
      modal: {
        ondismiss: () => {
          setModalStatus(null);
          onFailure?.({ code: "DISMISSED", description: "User closed payment" });
        },
      },
      handler: (response) => {
        // Razorpay calls this on successful payment
        setPaymentId(response.razorpay_payment_id);
        setModalStatus("success");
        onSuccess?.(
          response.razorpay_payment_id,
          response.razorpay_order_id,
          response.razorpay_signature
        );
        /*
         * PRODUCTION: Verify signature on your backend before granting access.
         * POST { razorpay_payment_id, razorpay_order_id, razorpay_signature }
         * to /api/verify-payment — never trust client-side confirmation alone.
         */
      },
    };

    const rzp = new window.Razorpay(options);

    rzp.on("payment.failed", (response) => {
      setErrorMsg(response.error?.description ?? "Payment failed.");
      setModalStatus("failed");
      onFailure?.(response.error);
    });

    // 4. Close our loading modal & open Razorpay's native modal
    setModalStatus(null);
    rzp.open();
  }, [amount, purpose, description, buyerName, buyerContact, buyerEmail, onSuccess, onFailure, disabled]);

  // ── Button variants ──
  const baseBtn =
    "relative inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed select-none font-['DM_Sans']";

  const variants = {
    default:
      "w-full py-3.5 px-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm shadow-lg shadow-emerald-200",
    compact:
      "py-2.5 px-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm shadow-md shadow-emerald-200",
    inline:
      "py-2 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-sm",
  };

  const btnClass = `${baseBtn} ${variants[variant] ?? variants.default}`;

  return (
    <>
      {/* ── Payment Button ── */}
      <div className={className}>
        <button
          onClick={handlePay}
          disabled={disabled || modalStatus === "loading"}
          className={btnClass}
        >
          {/* Rupee icon */}
          <span className="w-4 h-4 flex items-center justify-center text-base leading-none">
            ₹
          </span>
          <span>
            {purpose} — ₹{amount.toLocaleString("en-IN")}
          </span>
          {/* Lock icon */}
          <svg className="w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </button>

        {/* Secured by line — shown only on default variant */}
        {variant === "default" && (
          <p className="mt-2 text-center text-xs text-gray-400 font-['DM_Sans']">
            Secured by Razorpay · UPI · Cards · Net Banking
          </p>
        )}
      </div>

      {/* ── Status Modal ── */}
      <PaymentModal
        status={modalStatus}
        amount={amount}
        purpose={purpose}
        description={description}
        paymentId={paymentId}
        errorMsg={errorMsg}
        onClose={() => setModalStatus(null)}
      />
    </>
  );
}
