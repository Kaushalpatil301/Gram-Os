import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { forecastDemand, calculateInventoryLevels, analyzeWaste } from "../utils/forecasting.js";

/**
 * Get inventory forecast for a retailer
 * Uses historical transaction data to predict future demand
 */
export const getInventoryForecast = asyncHandler(async (req, res) => {
  const { retailerEmail } = req.params;
  const { 
    product, 
    daysAhead = 7, 
    method = 'hybrid',
    seasonalityEnabled = true 
  } = req.query;

  // Mock historical data - In production, fetch from database
  // Based on retailer's transaction history
  const historicalData = generateMockHistoricalData(product);

  const forecast = forecastDemand(historicalData, {
    method,
    daysAhead: parseInt(daysAhead),
    seasonalityEnabled: seasonalityEnabled === 'true',
    currentMonth: new Date().getMonth() + 1
  });

  return res.status(200).json(
    new ApiResponse(200, {
      product,
      retailerEmail,
      forecast,
      generatedAt: new Date().toISOString()
    }, "Inventory forecast generated successfully")
  );
});

/**
 * Get optimal inventory levels and reorder points
 */
export const getInventoryLevels = asyncHandler(async (req, res) => {
  const { retailerEmail } = req.params;
  const { product, currentStock } = req.query;

  if (!currentStock) {
    throw new ApiError(400, "Current stock quantity is required");
  }

  const historicalData = generateMockHistoricalData(product);
  
  const levels = calculateInventoryLevels(
    historicalData, 
    parseInt(currentStock),
    {
      leadTimeDays: 3,
      serviceLevel: 0.95,
      orderingCost: 100,
      holdingCostPerUnit: 10
    }
  );

  return res.status(200).json(
    new ApiResponse(200, {
      product,
      retailerEmail,
      levels,
      generatedAt: new Date().toISOString()
    }, "Inventory levels calculated successfully")
  );
});

/**
 * Get waste analysis and recommendations
 */
export const getWasteAnalysis = asyncHandler(async (req, res) => {
  const { retailerEmail } = req.params;
  const { startDate, endDate } = req.query;

  // Mock inventory and sales history
  const inventoryHistory = generateMockInventoryHistory();
  const salesHistory = generateMockSalesHistory();

  const wasteAnalysis = analyzeWaste(inventoryHistory, salesHistory);

  return res.status(200).json(
    new ApiResponse(200, {
      retailerEmail,
      period: { startDate, endDate },
      analysis: wasteAnalysis,
      generatedAt: new Date().toISOString()
    }, "Waste analysis completed successfully")
  );
});

/**
 * Get comprehensive inventory insights for dashboard
 */
export const getInventoryInsights = asyncHandler(async (req, res) => {
  const { retailerEmail } = req.params;

  // Mock data for multiple products
  const products = ['Tomatoes', 'Onions', 'Potatoes', 'Carrots', 'Rice', 'Wheat'];
  
  const insights = products.map(product => {
    const historicalData = generateMockHistoricalData(product);
    const currentStock = Math.floor(Math.random() * 200) + 50;
    
    const forecast = forecastDemand(historicalData, {
      method: 'hybrid',
      daysAhead: 7,
      seasonalityEnabled: true,
      currentMonth: new Date().getMonth() + 1
    });
    
    const levels = calculateInventoryLevels(historicalData, currentStock, {
      leadTimeDays: 3,
      serviceLevel: 0.95
    });

    return {
      product,
      currentStock,
      forecast: forecast.forecast,
      confidence: forecast.confidence,
      trend: forecast.trend,
      reorderPoint: levels.reorderPoint,
      status: levels.status,
      urgency: levels.urgency,
      daysOfStock: levels.daysOfStock,
      recommendations: forecast.recommendations.slice(0, 2) // Top 2 recommendations
    };
  });

  // Calculate summary statistics
  const totalProducts = insights.length;
  const lowStockItems = insights.filter(i => i.status === 'low-stock' || i.status === 'reorder-needed').length;
  const overstockItems = insights.filter(i => i.status === 'overstock').length;
  const healthyItems = insights.filter(i => i.status === 'healthy').length;

  return res.status(200).json(
    new ApiResponse(200, {
      retailerEmail,
      summary: {
        totalProducts,
        lowStockItems,
        overstockItems,
        healthyItems,
        alertsCount: lowStockItems
      },
      insights,
      generatedAt: new Date().toISOString()
    }, "Inventory insights generated successfully")
  );
});

/**
 * Get alerts and notifications for inventory
 */
export const getInventoryAlerts = asyncHandler(async (req, res) => {
  const { retailerEmail } = req.params;

  const alerts = [
    {
      id: 1,
      type: 'reorder',
      priority: 'high',
      product: 'Tomatoes',
      message: 'Stock below reorder point - Order 150kg within 2 days',
      currentStock: 45,
      reorderPoint: 80,
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 2,
      type: 'demand-spike',
      priority: 'medium',
      product: 'Onions',
      message: 'Demand forecasted to increase 25% next week',
      forecast: 180,
      currentTrend: 'upward',
      timestamp: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 3,
      type: 'overstock',
      priority: 'low',
      product: 'Rice',
      message: 'Overstock detected - Consider promotional pricing',
      currentStock: 450,
      optimalStock: 250,
      timestamp: new Date(Date.now() - 10800000).toISOString()
    },
    {
      id: 4,
      type: 'waste-warning',
      priority: 'medium',
      product: 'Carrots',
      message: 'High waste risk - 60kg expiring in 3 days',
      expiringQuantity: 60,
      daysUntilExpiry: 3,
      timestamp: new Date(Date.now() - 14400000).toISOString()
    }
  ];

  return res.status(200).json(
    new ApiResponse(200, {
      retailerEmail,
      alerts,
      totalAlerts: alerts.length,
      highPriority: alerts.filter(a => a.priority === 'high').length,
      generatedAt: new Date().toISOString()
    }, "Inventory alerts retrieved successfully")
  );
});

// ============== Helper Functions ==============

function generateMockHistoricalData(product) {
  const days = 30;
  const data = [];
  const baseQuantity = 50 + Math.random() * 50;
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    
    // Add seasonality and randomness
    const seasonalFactor = 1 + Math.sin((date.getDate() / 30) * Math.PI) * 0.2;
    const randomFactor = 0.8 + Math.random() * 0.4;
    const quantity = Math.round(baseQuantity * seasonalFactor * randomFactor);
    
    data.push({
      date: date.toISOString().split('T')[0],
      month: date.getMonth() + 1,
      quantity,
      product
    });
  }
  
  return data;
}

function generateMockInventoryHistory() {
  const days = 30;
  const inventory = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    
    inventory.push({
      date: date.toISOString().split('T')[0],
      product: 'Tomatoes',
      quantity: 80 + Math.floor(Math.random() * 40),
      price: 25,
      carryOver: 0
    });
  }
  
  return inventory;
}

function generateMockSalesHistory() {
  const days = 30;
  const sales = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    
    sales.push({
      date: date.toISOString().split('T')[0],
      product: 'Tomatoes',
      quantity: 60 + Math.floor(Math.random() * 30)
    });
  }
  
  return sales;
}

export default {
  getInventoryForecast,
  getInventoryLevels,
  getWasteAnalysis,
  getInventoryInsights,
  getInventoryAlerts
};
