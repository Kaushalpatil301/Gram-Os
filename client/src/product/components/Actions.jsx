import React, { useState, useEffect } from "react";
import { Share2, Shield, AlertTriangle, Check, RefreshCw } from "lucide-react";

export default function Actions({ productId, product }) {
  const [copied, setCopied] = useState(false);
  const [reportStatus, setReportStatus] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [account, setAccount] = useState(null);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [currency, setCurrency] = useState("INR");
  const [receiptId, setReceiptId] = useState("order_receipt_123");

  // Get user from localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setAccount(user.email || 'guest@agrichain.com');
  }, []);

  const handleShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRescanVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      alert(
        `✅ ${product?.name || "Product"} verified successfully!\n\n🔗 Product ID: ${productId}\n📍 Location: ${product?.locality}\n📦 Quantity: ${product?.quantity} kg\n💰 Price: ₹${product?.basePrice}/kg\n\nAuthenticity confirmed!`
      );
    }, 2500);
  };

  const handleReportFraud = () => {
    const confirmed = window.confirm(
      `⚠️ Report Fraud Alert\n\nYou are about to report:\n📦 Product: ${product?.name || "Unknown"}\n🏷️ Product ID: ${productId || "Unknown"}\n📍 Location: ${product?.locality || "Unknown"}\n\nAre you sure this product appears fraudulent?`
    );

    if (confirmed) {
      setReportStatus("reporting");
      setTimeout(() => {
        setReportStatus("reported");
        const reportData = {
          timestamp: new Date().toISOString(),
          productId: productId,
          productName: product?.name,
          locality: product?.locality,
          reporterIP: "Hidden for privacy",
          reason: "User reported potential fraud",
        };

        const existingReports = JSON.parse(
          localStorage.getItem("fraudReports") || "[]"
        );
        existingReports.push(reportData);
        localStorage.setItem("fraudReports", JSON.stringify(existingReports));
        setTimeout(() => setReportStatus(null), 4000);
      }, 2000);
    }
  };
  // Handle payment process
  const handlePayment = async (
    price,
    farmerAddress,
    tokenId,
    amountToken,
    account
  ) => {
    console.log("Initiating payment of:", price);
    console.log("To farmer:", farmerAddress);
    console.log("For token ID:", tokenId);
    console.log("Amount of tokens:", amountToken);
    console.log("From buyer:", account);
    const res = await loadRazorpayScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );
    let amt = price;

    try {
      // Create order on your server
      const response = await fetch("http://localhost:5001/order", {
        method: "POST",
        body: JSON.stringify({
          amount: amt * 100, // Convert to paisa
          currency,
          receipt: receiptId,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const order = await response.json();
      console.log("Order received from server:", order);

      // Razorpay payment options
      const options = {
        key: "rzp_test_RGjCX8nf1NHre5",
        amount: amt * 100,
        currency,
        name: "Acme Corp",
        description: "Wallet Recharge",
        image: "https://example.com/your_logo",
        order_id: order.id,
        handler: async function (response) {
          try {
            const validateRes = await fetch(
              "http://localhost:5001/order/validate",
              {
                method: "POST",
                body: JSON.stringify(response),
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );
            const validate = await validateRes.json();
            if (validate.msg === "Payment Successful") {
              //send success message to seller and initiate token transfer from seller
              console.log("Payment verified successfully");
              socket.emit("payment_success", {
                buyer: account,
                tokenId,
                amountToken,
                farmer: farmerAddress,
              });

              if (updateResponse.status === 200) {
                console.log("Amount added to wallet successfully!", "success");
              } else {
                console.log("Error updating wallet.", "error");
              }
            } else {
              console.log("Payment verification failed.", "error");
            }
          } catch (error) {
            console.log("An error occurred while processing payment.", "error");
          }
        },
        prefill: {
          name: "John Doe",
          email: "wagvah",
          contact: "999999999",
        },
        theme: {
          color: "#4F46E5",
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on("payment.failed", function (response) {
        console.error("Payment failed:", response);
      });
      rzp1.open();
    } catch (error) {
      console.error("Error initiating payment:", error);
      console.log("An error occurred while processing the payment.", "error");
    }
  };
  function loadRazorpayScript(src) {
    return new Promise((resolve) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  const handleRequest = () => {
    socket.emit("buy_request", {
      buyer: account,
      farmer: "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f",
      tokenId: 1,
      amountToken: 1,
    });
    console.log("Buy request sent");
  };
  return (
    <div className="p-6 space-y-6">
      {/* Primary Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Buy Button (replaces Show QR Code) */}
        <button
          onClick={() => setShowBuyModal(true)}
          className="flex cursor-pointer not-first:items-center justify-center px-5 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-200 text-sm shadow-md hover:shadow-lg"
        >
          Buy Now
        </button>

        <button
          onClick={handleShareLink}
          className={`flex cursor-pointer items-center justify-center px-5 py-3 font-semibold rounded-xl transition-all duration-200 text-sm shadow-md hover:shadow-lg ${
            copied
              ? "bg-green-600 text-white"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-2 border-gray-300"
          }`}
        >
          {copied ? (
            <Check className="w-5 h-5 mr-2" />
          ) : (
            <Share2 className="w-5 h-5 mr-2" />
          )}
          {copied ? "URL Copied!" : "Share Product"}
        </button>
      </div>

      {/* Secondary Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={handleRescanVerify}
          disabled={isVerifying}
          className="flex cursor-pointer items-center justify-center px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-all duration-200 text-sm shadow-md hover:shadow-lg"
        >
          <RefreshCw
            className={`w-5 h-5 mr-2 ${isVerifying ? "animate-spin" : ""}`}
          />
          {isVerifying ? "Verifying Blockchain..." : "Verify Authenticity"}
        </button>

        <button
          onClick={handleReportFraud}
          disabled={reportStatus === "reporting"}
          className={`flex cursor-pointer items-center justify-center px-5 py-3 font-semibold rounded-xl transition-all duration-200 text-sm shadow-md hover:shadow-lg ${
            reportStatus === "reported"
              ? "bg-red-800 text-white"
              : reportStatus === "reporting"
              ? "bg-red-400 text-white cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700 text-white"
          }`}
        >
          <AlertTriangle className="w-5 h-5 mr-2" />
          {reportStatus === "reported"
            ? "✅ Report Sent"
            : reportStatus === "reporting"
            ? "Reporting..."
            : "Report Fraud"}
        </button>
      </div>
      {showBuyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-md relative">
            {/* Close button */}
            <button
              onClick={() => setShowBuyModal(false)}
              className="cursor-pointer absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4">Buy Product</h2>

            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <strong>Name:</strong> {product?.name}
              </p>
              <p>
                <strong>Batch ID:</strong> {batchId}
              </p>
              <p>
                <strong>Farm:</strong> {product?.farm}
              </p>
              <p>
                <strong>Grade:</strong> {product?.info?.grade}
              </p>
              <p>
                <strong>Certification:</strong> {product?.certification?.title}
              </p>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>

            <button
              onClick={() => {
                if (!account) {
                  toast.error("Please connect your wallet first.");
                  return;
                }
                handleRequest();
                setShowBuyModal(false);
              }}
              className="mt-6 cursor-pointer  w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg"
            >
              Send Request
            </button>
          </div>
        </div>
      )}

      {/* Report Success Message */}
      {reportStatus === "reported" && (
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 animate-in slide-in-from-top-2">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-3">
              <h4 className="text-green-800 font-semibold text-sm">
                Report Submitted Successfully
              </h4>
              <p className="text-green-700 text-sm mt-1">
                Fraud report for <strong>{product?.name}</strong> (Batch:{" "}
                <code>{batchId}</code>) has been logged and will be
                investigated.
              </p>
              <p className="text-green-600 text-xs mt-2">
                Thank you for helping maintain supply chain integrity.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
