import { Product } from "../models/product.models.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createProduct = asyncHandler(async (req, res) => {
  console.log("📦 Creating product...");
  console.log("Body:", req.body);
  console.log("File:", req.file);

  const { name, type, quantity, basePrice, locality, farmerEmail } = req.body;

  if (!name || !type || !quantity || !basePrice || !locality) {
    // Delete uploaded image if validation fails
    if (req.file?.filename) {
      await deleteFromCloudinary(req.file.filename);
    }
    throw new ApiError(
      400,
      "Required fields: name, type, quantity, basePrice, locality",
    );
  }

  let farmer = null;
  if (farmerEmail) {
    farmer = await User.findOne({ email: farmerEmail });
  }

  // Get image URL from Cloudinary upload
  const imageUrl = req.file ? req.file.path : null;
  const imagePublicId = req.file ? req.file.filename : null;

  console.log("Image URL:", imageUrl);
  console.log("Image Public ID:", imagePublicId);

  try {
    const product = await Product.create({
      name,
      type,
      quantity,
      basePrice,
      locality,
      image: imageUrl,
      imagePublicId: imagePublicId,
      farmerId: farmer?._id || null,
      farmerEmail: farmerEmail || "demo@agrichain.com",
    });

    product.farmId = `FARM_${product._id}`;
    await product.save();

    console.log("✅ Product created:", product._id);

    return res
      .status(201)
      .json(new ApiResponse(201, { product }, "Product created successfully"));
  } catch (error) {
    // Delete uploaded image if product creation fails
    if (imagePublicId) {
      await deleteFromCloudinary(imagePublicId);
      console.log("🗑️ Deleted orphaned image from Cloudinary");
    }

    // Send better error message for validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      throw new ApiError(400, `Validation failed: ${messages.join(", ")}`);
    }
    throw error;
  }
});

const getAllProducts = asyncHandler(async (req, res) => {
  const { type, locality, farmerId, farmerEmail, status } = req.query;

  const filter = {};
  if (type) filter.type = type;
  if (locality) filter.locality = { $regex: locality, $options: "i" };
  if (farmerId) filter.farmerId = farmerId;
  if (farmerEmail) filter.farmerEmail = farmerEmail;
  if (status) filter.status = status;

  const products = await Product.find(filter)
    .sort({ createdAt: -1 })
    .populate("farmerId", "username email");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { products, count: products.length },
        "Products fetched successfully",
      ),
    );
});

const getProductsByFarmer = asyncHandler(async (req, res) => {
  const { email } = req.params;

  if (!email) {
    throw new ApiError(400, "Farmer email is required");
  }

  const products = await Product.find({ farmerEmail: email }).sort({
    createdAt: -1,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { products, count: products.length },
        "Farmer products fetched successfully",
      ),
    );
});

const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id).populate(
    "farmerId",
    "username email",
  );

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { product }, "Product fetched successfully"));
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, type, quantity, basePrice, locality, status } = req.body;

  const product = await Product.findById(id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (name) product.name = name;
  if (type) product.type = type;
  if (quantity !== undefined) product.quantity = quantity;
  if (basePrice !== undefined) product.basePrice = basePrice;
  if (locality) product.locality = locality;
  if (status) product.status = status;

  // Handle image update
  if (req.file) {
    // Delete old image from Cloudinary if exists
    if (product.imagePublicId) {
      await deleteFromCloudinary(product.imagePublicId);
    }
    product.image = req.file.path;
    product.imagePublicId = req.file.filename;
  }

  await product.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { product }, "Product updated successfully"));
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Delete image from Cloudinary if exists
  if (product.imagePublicId) {
    await deleteFromCloudinary(product.imagePublicId);
  }

  await Product.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Product deleted successfully"));
});

const getProductStats = asyncHandler(async (req, res) => {
  const { email } = req.params;

  const products = await Product.find({ farmerEmail: email });

  const stats = {
    totalProducts: products.length,
    totalQuantity: products.reduce((sum, p) => sum + p.quantity, 0),
    avgBasePrice:
      products.length > 0
        ? products.reduce((sum, p) => sum + p.basePrice, 0) / products.length
        : 0,
    byType: {},
    byStatus: {
      available: 0,
      sold: 0,
      reserved: 0,
    },
  };

  products.forEach((p) => {
    stats.byType[p.type] = (stats.byType[p.type] || 0) + 1;

    stats.byStatus[p.status] = (stats.byStatus[p.status] || 0) + 1;
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { stats },
        "Product statistics fetched successfully",
      ),
    );
});

// Predict price using ML model
const predictPrice = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Find the product
  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Prepare product data for Python script
  const productData = {
    name: product.name,
    type: product.type,
    locality: product.locality,
    quantity: product.quantity,
    basePrice: product.basePrice,
    image: product.image || "",
  };

  // Path to Python script (in server root directory)
  const pythonScriptPath = path.join(__dirname, "../../predict_price.py");

  return new Promise((resolve, reject) => {
    // Call Python script with product data
    const pythonProcess = spawn("python", [
      pythonScriptPath,
      JSON.stringify(productData),
    ]);

    let result = "";
    let errorOutput = "";

    pythonProcess.stdout.on("data", (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        console.error("Python script error:", errorOutput);
        return res
          .status(500)
          .json(
            new ApiResponse(
              500,
              null,
              `Price prediction failed: ${errorOutput}`,
            ),
          );
      }

      try {
        const prediction = JSON.parse(result);

        if (!prediction.success) {
          return res
            .status(500)
            .json(
              new ApiResponse(
                500,
                null,
                prediction.message || "Price prediction failed",
              ),
            );
        }

        return res.status(200).json(
          new ApiResponse(
            200,
            {
              productId: product._id,
              productName: product.name,
              farmerPrice: product.basePrice,
              predictedPrice: prediction.predictedPrice,
            },
            "Price predicted successfully",
          ),
        );
      } catch (error) {
        console.error("Error parsing Python output:", error);
        return res
          .status(500)
          .json(
            new ApiResponse(500, null, "Failed to parse prediction result"),
          );
      }
    });

    pythonProcess.on("error", (error) => {
      console.error("Failed to start Python process:", error);
      return res
        .status(500)
        .json(
          new ApiResponse(
            500,
            null,
            "Failed to start prediction service. Ensure Python is installed.",
          ),
        );
    });
  });
});

export {
  createProduct,
  getAllProducts,
  getProductsByFarmer,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductStats,
  predictPrice,
};
