import mongoose from "mongoose";
import dotenv from "dotenv";
import { Product } from "../src/models/product.models.js";
import { predictPriceWithAI } from "../src/utils/pricePredictor.js";

dotenv.config();

const updateOldPrices = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to DB");

    const products = await Product.find({});
    console.log(`Found ${products.length} products to update`);

    for (const product of products) {
      console.log(`Predicting for: ${product.name}...`);
      const predictedPrice = await predictPriceWithAI({
        name: product.name,
        type: product.type,
        locality: product.locality,
        basePrice: product.basePrice,
      });

      if (predictedPrice) {
        product.aiPredictedPrice = predictedPrice;
        await product.save();
        console.log(`✅ Updated ${product.name}: ${predictedPrice}`);
      } else {
        console.log(`❌ Failed to predict for ${product.name}`);
      }
    }

    console.log("Migration completed");
    process.exit(0);
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
};

updateOldPrices();
