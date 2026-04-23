import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Flag, Send, Upload } from "lucide-react";
import { useTranslation } from "../i18n/config";

export default function ReportIssuePopup({ isOpen, onClose, onSubmit }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    issueType: "",
    productId: "",
    image: null,
    description: ""
  });
  const modalRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Escape') onClose();
  }, [onClose]);

  const handleClickOutside = useCallback((event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, handleKeyDown, handleClickOutside]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0]; // 🔧 BUG FIX: Use [0] to get the first file
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ 
          ...prev, 
          image: {
            file: file,
            preview: reader.result,
            name: file.name
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.description.trim()) {
      onSubmit(formData);
      setFormData({ issueType: "", productId: "", image: null, description: "" });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div ref={modalRef} className="bg-white rounded-xl shadow-xl w-full max-w-sm md:max-w-md max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b">
          <div className="flex items-center gap-2 md:gap-3">
            <Flag className="h-4 w-4 md:h-5 md:w-5 text-red-500" />
            <h2 className="text-base md:text-lg font-semibold text-gray-900">{t("report.title")}</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="h-4 w-4 md:h-5 md:w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-6">
          
          {/* Issue Type (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("report.type")} <span className="text-gray-400 text-xs">({t("common.optional")})</span>
            </label>
            <select
              name="issueType"
              value={formData.issueType}
              onChange={handleInputChange}
              className="w-full p-2.5 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm md:text-base"
            >
              <option value="">{t("report.selectType")}</option>
              <option value="quality">{t("report.qualityIssues")}</option>
              <option value="authenticity">{t("report.authenticityIssues")}</option>
              <option value="supply-chain">{t("report.supplyChainIssues")}</option>
              <option value="labeling">{t("report.labelingIssues")}</option>
              <option value="contamination">{t("report.contaminationIssues")}</option>
              <option value="payment">{t("report.paymentIssues")}</option>
              <option value="fraud">{t("report.fraudIssues")}</option>
              <option value="packaging">{t("report.packagingIssues")}</option>
              <option value="other">{t("report.otherIssues")}</option>
            </select>
          </div>

          {/* Product ID (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("report.productId")}
            </label>
            <input
              type="text"
              name="productId"
              value={formData.productId}
              onChange={handleInputChange}
              placeholder={t("report.productIdPlaceholder")}
              className="w-full p-2.5 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm md:text-base"
            />
          </div>

          {/* Upload Image (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("report.uploadImage")}
            </label>
            
            {!formData.image ? (
              <div className="relative">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-3 md:p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-400 hover:bg-red-50 transition-colors flex flex-col items-center gap-2 text-sm md:text-base"
                >
                  <Upload className="h-6 w-6 md:h-8 md:w-8 text-gray-400" />
                  <span className="text-gray-600">{t("report.uploadText")}</span>
                  <span className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</span>
                </button>
              </div>
            ) : (
              <div className="relative rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={formData.image.preview}
                  alt="Upload preview"
                  className="w-full h-32 md:h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs text-gray-700 truncate max-w-[200px]">
                  {formData.image.name}
                </div>
              </div>
            )}
          </div>

          {/* Description (Required) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("report.description")} *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              placeholder={t("report.descriptionPlaceholder")}
              className="w-full p-2.5 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-sm md:text-base"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base"
            >
              {t("report.cancel")}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center gap-2 transition-colors text-sm md:text-base"
            >
              <Send className="h-4 w-4" />
              {t("report.submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
