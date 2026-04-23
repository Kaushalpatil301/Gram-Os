import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

export default function OtpModal({
  isOpen,
  onClose,
  onVerify,
  phoneNumber,
  title = "Verify Phone Number",
  isSubmitting = false,
  error = "",
  onResendOtp
}) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpTimer, setOtpTimer] = useState(60);
  const [canResendOtp, setCanResendOtp] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (isOpen) {
      startOtpTimer();
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  const startOtpTimer = () => {
    setOtpTimer(60);
    setCanResendOtp(false);
    const timer = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResendOtp(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOtpChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const otpString = otp.join("");
    if (otpString.length === 6) onVerify(otpString);
  };

  const handleResendOtp = async () => {
    if (canResendOtp && onResendOtp) {
      await onResendOtp();
      startOtpTimer();
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  const handleClose = () => {
    setOtp(["", "", "", "", "", ""]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-gray-600 text-center">
            Enter the 6-digit code sent to +91 {phoneNumber}
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP *
              </label>
              
              <div className="flex gap-2 justify-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className={`w-12 h-12 text-center text-lg font-semibold border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                      error ? "border-red-300" : "border-gray-300"
                    }`}
                    disabled={isSubmitting}
                  />
                ))}
              </div>
              
              {error && <p className="text-sm text-red-500 mt-2 text-center">{error}</p>}
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : "Didn't receive code?"}
              </span>
              <button
                onClick={handleResendOtp}
                disabled={!canResendOtp || isSubmitting}
                className={`font-medium ${
                  canResendOtp && !isSubmitting ? "text-green-600 hover:text-green-700" : "text-gray-400"
                }`}
              >
                Resend OTP
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleVerify}
              disabled={isSubmitting || otp.some(digit => digit === "")}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium transition-colors"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
              ) : (
                "Verify OTP"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
