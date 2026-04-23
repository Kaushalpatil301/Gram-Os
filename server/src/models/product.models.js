import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },

    type: {
      type: String,
      required: [true, "Product type is required"],
      enum: [
        "Vegetable",
        "Fruit",
        "Grain",
        "Leafy Greens",
        "Pulse",
        "Spice",
        "Dairy",
        "Other",
      ],
    },

    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
    },

    basePrice: {
      type: Number,
      required: [true, "Base price is required"],
      min: [0, "Price cannot be negative"],
    },

    locality: {
      type: String,
      required: [true, "Locality is required"],
      trim: true,
    },

    image: {
      type: String,
      default: null,
    },

    imagePublicId: {
      type: String,
      default: null,
    },

    farmerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },

    farmerEmail: {
      type: String,
      required: false,
      default: "demo@agrichain.com",
    },

    farmId: {
      type: String,
      default: function () {
        return `FARM_${this._id}`;
      },
    },

    status: {
      type: String,
      enum: ["available", "sold", "reserved"],
      default: "available",
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
productSchema.index({ farmerId: 1 });
productSchema.index({ type: 1 });
productSchema.index({ locality: 1 });

export const Product = mongoose.model("Product", productSchema);
