import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { getMarketIntelligence } from "../utils/marketIntelligence.js";

const getRegionalIntelligence = asyncHandler(async (req, res) => {
  const { locality, soil, produce } = req.query;

  try {
    const data = await getMarketIntelligence(locality, soil, produce);
    
    return res.status(200).json(
      new ApiResponse(200, data, "Market intelligence fetched successfully")
    );
  } catch (error) {
    throw new ApiError(500, error.message || "Failed to fetch market intelligence");
  }
});

export { getRegionalIntelligence };
