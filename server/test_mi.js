import { getMarketIntelligence } from "./src/utils/marketIntelligence.js";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const test = async () => {
  try {
    const data = await getMarketIntelligence("Thane", "Unknown", "tomatoes");
    console.log("Success:", data);
  } catch (error) {
    console.error("Test Error:", error);
  }
};

test();
