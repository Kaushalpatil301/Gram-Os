/**
 * AI-Powered Inventory Forecasting Utility
 * Uses historical data, seasonality, and trend analysis to predict demand
 */

/**
 * Calculate Simple Moving Average (SMA)
 */
function calculateSMA(data, period) {
  if (data.length < period) return data[data.length - 1] || 0;
  
  const slice = data.slice(-period);
  const sum = slice.reduce((acc, val) => acc + val, 0);
  return sum / period;
}

/**
 * Calculate Exponential Moving Average (EMA)
 * Gives more weight to recent data
 */
function calculateEMA(data, period) {
  if (data.length === 0) return 0;
  if (data.length < period) return calculateSMA(data, data.length);
  
  const multiplier = 2 / (period + 1);
  let ema = calculateSMA(data.slice(0, period), period);
  
  for (let i = period; i < data.length; i++) {
    ema = (data[i] - ema) * multiplier + ema;
  }
  
  return ema;
}

/**
 * Detect trend direction (upward, downward, or stable)
 */
function detectTrend(data) {
  if (data.length < 3) return 'stable';
  
  const recent = data.slice(-3);
  const slope = (recent[2] - recent[0]) / 2;
  
  if (slope > 0.1) return 'upward';
  if (slope < -0.1) return 'downward';
  return 'stable';
}

/**
 * Calculate seasonality factor based on historical patterns
 */
function calculateSeasonalityFactor(currentMonth, historicalData) {
  // Group by month and calculate average
  const monthlyAverages = {};
  let totalAverage = 0;
  
  historicalData.forEach(entry => {
    const month = entry.month || currentMonth;
    if (!monthlyAverages[month]) {
      monthlyAverages[month] = [];
    }
    monthlyAverages[month].push(entry.quantity);
    totalAverage += entry.quantity;
  });
  
  totalAverage /= historicalData.length;
  
  // Calculate seasonality factor for current month
  if (monthlyAverages[currentMonth] && monthlyAverages[currentMonth].length > 0) {
    const monthAvg = monthlyAverages[currentMonth].reduce((a, b) => a + b, 0) / monthlyAverages[currentMonth].length;
    return monthAvg / totalAverage;
  }
  
  return 1; // Neutral seasonality
}

/**
 * Calculate reorder point based on lead time and safety stock
 */
function calculateReorderPoint(avgDailyDemand, leadTimeDays, safetyStock) {
  return (avgDailyDemand * leadTimeDays) + safetyStock;
}

/**
 * Calculate Economic Order Quantity (EOQ)
 */
function calculateEOQ(annualDemand, orderingCost, holdingCost) {
  if (holdingCost === 0) return Math.sqrt(2 * annualDemand * orderingCost);
  return Math.sqrt((2 * annualDemand * orderingCost) / holdingCost);
}

/**
 * Main Forecasting Function
 * Predicts demand for next period using multiple algorithms
 */
export function forecastDemand(historicalData, options = {}) {
  const {
    method = 'hybrid', // 'sma', 'ema', 'trend', 'hybrid'
    period = 7, // days to look back
    daysAhead = 7, // days to forecast
    seasonalityEnabled = true,
    currentMonth = new Date().getMonth() + 1
  } = options;
  
  // Extract quantity data
  const quantities = historicalData.map(d => d.quantity || 0);
  
  if (quantities.length === 0) {
    return {
      forecast: 0,
      confidence: 0,
      method: 'no-data',
      trend: 'unknown',
      recommendations: ['No historical data available']
    };
  }
  
  // Calculate base forecast using different methods
  let baseForecast;
  
  switch (method) {
    case 'sma':
      baseForecast = calculateSMA(quantities, period);
      break;
    case 'ema':
      baseForecast = calculateEMA(quantities, period);
      break;
    case 'trend':
      baseForecast = quantities[quantities.length - 1];
      break;
    case 'hybrid':
    default:
      // Weighted average of SMA and EMA
      const sma = calculateSMA(quantities, period);
      const ema = calculateEMA(quantities, period);
      baseForecast = (sma * 0.4) + (ema * 0.6);
  }
  
  // Apply seasonality adjustment
  let seasonalForecast = baseForecast;
  if (seasonalityEnabled && historicalData.length > 0) {
    const seasonalityFactor = calculateSeasonalityFactor(currentMonth, historicalData);
    seasonalForecast = baseForecast * seasonalityFactor;
  }
  
  // Detect trend
  const trend = detectTrend(quantities);
  
  // Apply trend adjustment
  let finalForecast = seasonalForecast;
  if (trend === 'upward') {
    finalForecast *= 1.1; // 10% increase for upward trend
  } else if (trend === 'downward') {
    finalForecast *= 0.9; // 10% decrease for downward trend
  }
  
  // Calculate confidence based on data consistency
  const variance = quantities.reduce((acc, val) => {
    const diff = val - baseForecast;
    return acc + (diff * diff);
  }, 0) / quantities.length;
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = stdDev / baseForecast;
  const confidence = Math.max(0, Math.min(100, 100 - (coefficientOfVariation * 50)));
  
  // Generate recommendations
  const recommendations = generateRecommendations({
    forecast: finalForecast,
    trend,
    confidence,
    historicalData,
    quantities
  });
  
  return {
    forecast: Math.round(finalForecast * daysAhead), // Total for forecast period
    dailyForecast: Math.round(finalForecast),
    confidence: Math.round(confidence),
    method,
    trend,
    seasonalityFactor: seasonalityEnabled ? calculateSeasonalityFactor(currentMonth, historicalData) : 1,
    recommendations,
    statistics: {
      avgDemand: Math.round(baseForecast),
      minDemand: Math.min(...quantities),
      maxDemand: Math.max(...quantities),
      stdDev: Math.round(stdDev)
    }
  };
}

/**
 * Calculate optimal inventory levels
 */
export function calculateInventoryLevels(historicalData, currentStock, options = {}) {
  const {
    leadTimeDays = 3,
    serviceLevel = 0.95, // 95% service level
    orderingCost = 100,
    holdingCostPerUnit = 10
  } = options;
  
  const quantities = historicalData.map(d => d.quantity || 0);
  const avgDailyDemand = quantities.reduce((a, b) => a + b, 0) / quantities.length;
  
  // Calculate standard deviation
  const variance = quantities.reduce((acc, val) => {
    const diff = val - avgDailyDemand;
    return acc + (diff * diff);
  }, 0) / quantities.length;
  const stdDev = Math.sqrt(variance);
  
  // Calculate safety stock (Z-score * std dev * sqrt(lead time))
  const zScore = 1.65; // For 95% service level
  const safetyStock = Math.round(zScore * stdDev * Math.sqrt(leadTimeDays));
  
  // Calculate reorder point
  const reorderPoint = calculateReorderPoint(avgDailyDemand, leadTimeDays, safetyStock);
  
  // Calculate EOQ
  const annualDemand = avgDailyDemand * 365;
  const eoq = calculateEOQ(annualDemand, orderingCost, holdingCostPerUnit);
  
  // Determine current status
  let status = 'healthy';
  let urgency = 'none';
  
  if (currentStock <= reorderPoint) {
    status = 'reorder-needed';
    urgency = 'high';
  } else if (currentStock <= reorderPoint * 1.2) {
    status = 'low-stock';
    urgency = 'medium';
  } else if (currentStock > eoq * 2) {
    status = 'overstock';
    urgency = 'low';
  }
  
  return {
    currentStock,
    reorderPoint: Math.round(reorderPoint),
    safetyStock,
    optimalOrderQuantity: Math.round(eoq),
    maxStock: Math.round(reorderPoint + eoq),
    status,
    urgency,
    daysOfStock: currentStock > 0 ? Math.round(currentStock / avgDailyDemand) : 0
  };
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations({ forecast, trend, confidence, historicalData, quantities }) {
  const recommendations = [];
  
  // Trend-based recommendations
  if (trend === 'upward') {
    recommendations.push('📈 Demand is trending upward - consider increasing stock levels by 10-15%');
  } else if (trend === 'downward') {
    recommendations.push('📉 Demand is declining - reduce ordering to prevent overstock');
  }
  
  // Confidence-based recommendations
  if (confidence < 60) {
    recommendations.push('⚠️ Low forecast confidence - monitor stock closely and adjust frequently');
  } else if (confidence > 85) {
    recommendations.push('✅ High forecast confidence - safe to optimize bulk ordering');
  }
  
  // Volatility recommendations
  const avgQuantity = quantities.reduce((a, b) => a + b, 0) / quantities.length;
  const maxVariation = Math.max(...quantities) - Math.min(...quantities);
  if (maxVariation > avgQuantity * 0.5) {
    recommendations.push('🔄 High demand volatility detected - maintain higher safety stock');
  }
  
  // Waste prevention for perishables
  if (forecast < avgQuantity * 0.7) {
    recommendations.push('🌱 Lower demand expected - order perishables conservatively to reduce waste');
  }
  
  return recommendations;
}

/**
 * Analyze waste and suggest improvements
 */
export function analyzeWaste(inventoryHistory, salesHistory) {
  const wasteData = [];
  let totalWaste = 0;
  let totalWasteValue = 0;
  
  inventoryHistory.forEach((item, index) => {
    const sold = salesHistory[index]?.quantity || 0;
    const waste = Math.max(0, item.quantity - sold - (item.carryOver || 0));
    
    if (waste > 0) {
      totalWaste += waste;
      totalWasteValue += waste * (item.price || 0);
      wasteData.push({
        date: item.date,
        product: item.product,
        waste,
        value: waste * (item.price || 0)
      });
    }
  });
  
  const wastePercentage = inventoryHistory.length > 0 
    ? (totalWaste / inventoryHistory.reduce((a, b) => a + (b.quantity || 0), 0)) * 100 
    : 0;
  
  return {
    totalWaste: Math.round(totalWaste),
    totalWasteValue: Math.round(totalWasteValue),
    wastePercentage: Math.round(wastePercentage * 10) / 10,
    wasteItems: wasteData,
    recommendations: generateWasteRecommendations(wastePercentage)
  };
}

function generateWasteRecommendations(wastePercentage) {
  const recommendations = [];
  
  if (wastePercentage > 15) {
    recommendations.push('🚨 Critical waste level - reduce ordering quantities immediately');
    recommendations.push('Consider implementing dynamic pricing for items near expiry');
  } else if (wastePercentage > 10) {
    recommendations.push('⚠️ Moderate waste - review forecasting accuracy and adjust orders');
  } else if (wastePercentage < 5) {
    recommendations.push('✨ Excellent waste management - current strategy is working well');
  }
  
  return recommendations;
}

export default {
  forecastDemand,
  calculateInventoryLevels,
  analyzeWaste
};
