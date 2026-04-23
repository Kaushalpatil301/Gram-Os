import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

// Lazy configuration function
const ensureCloudinaryConfigured = () => {
  const config = cloudinary.config();
  if (!config.cloud_name || !config.api_key) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    console.log("☁️ Cloudinary configured:", {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY
        ? "***" + process.env.CLOUDINARY_API_KEY.slice(-4)
        : "missing",
      api_secret: process.env.CLOUDINARY_API_SECRET
        ? "***configured"
        : "missing",
    });
  }
};

// Configure Multer Storage with Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    ensureCloudinaryConfigured();
    return {
      folder: "agrichain-products",
      allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
      transformation: [{ width: 1000, height: 1000, crop: "limit" }],
    };
  },
});

// Create multer upload middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Function to delete image from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    return false;
  }
};

export { upload, cloudinary, deleteFromCloudinary, ensureCloudinaryConfigured };
