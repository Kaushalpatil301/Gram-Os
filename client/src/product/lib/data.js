export const productsDatabase = {
  "LOT12345": {
    name: "Tomatoes",
    farm: "Green Valley Organic Farm, Nashik",
    fairPrice: { farmer: 20, retail: 45 },
    info: {
      lotId: "LOT12345",
      farmId: "FARM-Nashik-001",
      quantity: "500 kg",
      grade: "Premium A+",
      description: "Premium organic tomatoes grown using sustainable farming practices."
    },
    certification: {
      title: "Certified Organic",
      details: "FSSAI certified organic farming practices with zero pesticide residue."
    },
    image: "https://images.unsplash.com/photo-1546470427-e691e7862b2b?w=800&h=600&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1546470427-e691e7862b2b?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1574618317963-3cfa0da47711?w=400&h=300&fit=crop"
    ],
    status: "Fresh"
  },
  "LOT67890": {
    name: "Organic Spinach",
    farm: "Sunshine Organic Farm, Pune",
    fairPrice: { farmer: 15, retail: 35 },
    info: {
      lotId: "LOT67890",
      farmId: "FARM-Pune-002",
      quantity: "200 kg",
      grade: "Premium A",
      description: "Fresh organic spinach leaves, rich in iron and vitamins."
    },
    certification: {
      title: "Certified Organic",
      details: "NPOP certified organic farming with natural pest control methods."
    },
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&h=600&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1609501676725-7186f4932681?w=400&h=300&fit=crop"
    ],
    status: "Fresh"
  },
  "LOT11111": {
    name: "Fresh Carrots",
    farm: "Mountain View Farm, Ooty",
    fairPrice: { farmer: 18, retail: 40 },
    info: {
      lotId: "LOT11111",
      farmId: "FARM-Ooty-003",
      quantity: "300 kg",
      grade: "Premium A+",
      description: "Sweet and crunchy carrots grown in mountain soil."
    },
    certification: {
      title: "Natural Farming",
      details: "Zero chemical farming practices with natural fertilizers only."
    },
    image: "https://images.unsplash.com/photo-1445282768818-728615cc910a?w=800&h=600&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1445282768818-728615cc910a?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1508747703725-719777637510?w=400&h=300&fit=crop"
    ],
    status: "In Transit"
  },
  "LOT22222": {
    name: "Organic Onions",
    farm: "Nashik Organic Collective, Nashik",
    fairPrice: { farmer: 12, retail: 28 },
    info: {
      lotId: "LOT22222",
      farmId: "FARM-Nashik-004",
      quantity: "400 kg",
      grade: "Premium A",
      description: "High-quality organic onions with excellent storage life."
    },
    certification: {
      title: "Certified Organic",
      details: "India Organic certified with traceability documentation."
    },
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&h=600&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1508747703725-719777637510?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=400&h=300&fit=crop"
    ],
    status: "Fresh"
  },
  "LOT33333": {
    name: "Bell Peppers",
    farm: "Hydroponic Farms Ltd, Bangalore",
    fairPrice: { farmer: 25, retail: 60 },
    info: {
      lotId: "LOT33333",
      farmId: "FARM-BLR-005",
      quantity: "150 kg",
      grade: "Premium A+",
      description: "Colorful bell peppers grown in controlled hydroponic environment."
    },
    certification: {
      title: "Hydroponic Certified",
      details: "Soilless farming with precise nutrient management system."
    },
    image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800&h=600&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1525607551316-4a8e16d1f9ba?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=400&h=300&fit=crop"
    ],
    status: "Fresh"
  }
};

export const timelineDatabase = {
  "LOT12345": [
    {
      id: 1,
      title: "Farmer",
      icon: "🌾",
      date: "02 Sep 2025",
      location: "Nashik, Maharashtra",
      basicInfo: {
        "📅 Date": "02 Sep 2025 (Harvest date)",
        "📍 Location": "Nashik, Maharashtra",
        "👤 Farmer Name": "Ramesh Kumar"
      },
      detailedInfo: {
        "📦 Quantity": "500 kg",
        "💰 Price": "₹20/kg",
        "🔗 Lot ID": "LOT12345",
        "🔗 Blockchain Hash": "0xabc123def456ghi789jkl012mno345pqr678"
      }
    },
    {
      id: 2,
      title: "Distributor", 
      icon: "🚚",
      date: "03 Sep 2025",
      location: "Nashik → Mumbai",
      basicInfo: {
        "📅 Date": "03 Sep 2025 (Dispatch date)",
        "📍 Route": "Nashik → Mumbai",
        "👤 Distributor Name": "FreshLogistics Pvt. Ltd."
      },
      detailedInfo: {
        "📦 Quantity": "500 kg, cold storage",
        "💰 Transport Cost": "₹5/kg",
        "🌡️ Storage Method": "Cold Chain",
        "🔗 Blockchain Hash": "0xdef456ghi789jkl012mno345pqr678stu901"
      }
    },
    {
      id: 3,
      title: "Market",
      icon: "🏬", 
      date: "04 Sep 2025",
      location: "Vashi APMC Market, Mumbai",
      basicInfo: {
        "📅 Date": "04 Sep 2025 (Arrival at APMC)",
        "📍 Location": "Vashi APMC Market, Mumbai",
        "👤 Market Trader Name": "AgriTrade Ltd."
      },
      detailedInfo: {
        "📦 Quantity": "490 kg, 10 kg lost in handling",
        "💰 Price": "₹30/kg wholesale rate",
        "📊 Loss %": "2% during handling",
        "🔗 Blockchain Hash": "0xghi789jkl012mno345pqr678stu901vwx234"
      }
    },
    {
      id: 4,
      title: "Retailer",
      icon: "🏪",
      date: "05 Sep 2025", 
      location: "Andheri, Mumbai",
      basicInfo: {
        "📅 Date": "05 Sep 2025 (Arrival at store)",
        "📍 Location": "Andheri, Mumbai", 
        "👤 Retailer Name": "BigMart Mumbai"
      },
      detailedInfo: {
        "📦 Quantity": "480 kg after losses",
        "💰 Price": "₹45/kg retail rate",
        "📄 Contract Price": "₹35/kg (to distributor)",
        "🔗 Blockchain Hash": "0xjkl012mno345pqr678stu901vwx234yza567"
      }
    }
  ],
  "LOT67890": [
    {
      id: 1,
      title: "Farmer",
      icon: "🌾",
      date: "01 Sep 2025",
      location: "Pune, Maharashtra",
      basicInfo: {
        "📅 Date": "01 Sep 2025 (Harvest date)",
        "📍 Location": "Pune, Maharashtra",
        "👤 Farmer Name": "Sita Devi"
      },
      detailedInfo: {
        "📦 Quantity": "200 kg",
        "💰 Price": "₹15/kg",
        "🔗 Lot ID": "LOT67890",
        "🔗 Blockchain Hash": "0xspn123def456ghi789jkl012mno345pqr"
      }
    },
    {
      id: 2,
      title: "Distributor", 
      icon: "🚚",
      date: "02 Sep 2025",
      location: "Pune → Mumbai",
      basicInfo: {
        "📅 Date": "02 Sep 2025 (Dispatch date)",
        "📍 Route": "Pune → Mumbai",
        "👤 Distributor Name": "VeggieExpress Ltd."
      },
      detailedInfo: {
        "📦 Quantity": "200 kg, refrigerated",
        "💰 Transport Cost": "₹4/kg",
        "🌡️ Storage Method": "Refrigerated",
        "🔗 Blockchain Hash": "0xspn456ghi789jkl012mno345pqr678stu"
      }
    },
    {
      id: 3,
      title: "Retailer",
      icon: "🏪",
      date: "03 Sep 2025", 
      location: "Bandra, Mumbai",
      basicInfo: {
        "📅 Date": "03 Sep 2025 (Arrival at store)",
        "📍 Location": "Bandra, Mumbai", 
        "👤 Retailer Name": "FreshMart Bandra"
      },
      detailedInfo: {
        "📦 Quantity": "195 kg after losses",
        "💰 Price": "₹35/kg retail rate",
        "📄 Contract Price": "₹25/kg (to distributor)",
        "🔗 Blockchain Hash": "0xspn789jkl012mno345pqr678stu901vwx"
      }
    }
  ],
  "LOT11111": [
    {
      id: 1,
      title: "Farmer",
      icon: "🌾",
      date: "30 Aug 2025",
      location: "Ooty, Tamil Nadu",
      basicInfo: {
        "📅 Date": "30 Aug 2025 (Harvest date)",
        "📍 Location": "Ooty, Tamil Nadu",
        "👤 Farmer Name": "Murugan Raj"
      },
      detailedInfo: {
        "📦 Quantity": "300 kg",
        "💰 Price": "₹18/kg",
        "🔗 Lot ID": "LOT11111",
        "🔗 Blockchain Hash": "0xcar123def456ghi789jkl012mno345"
      }
    },
    {
      id: 2,
      title: "Distributor", 
      icon: "🚚",
      date: "31 Aug 2025",
      location: "Ooty → Chennai",
      basicInfo: {
        "📅 Date": "31 Aug 2025 (Dispatch date)",
        "📍 Route": "Ooty → Chennai",
        "👤 Distributor Name": "Hills Transport Co."
      },
      detailedInfo: {
        "📦 Quantity": "300 kg, ambient storage",
        "💰 Transport Cost": "₹6/kg",
        "🌡️ Storage Method": "Ventilated",
        "🔗 Blockchain Hash": "0xcar456ghi789jkl012mno345pqr678"
      }
    },
    {
      id: 3,
      title: "Retailer",
      icon: "🏪",
      date: "01 Sep 2025", 
      location: "T. Nagar, Chennai",
      basicInfo: {
        "📅 Date": "01 Sep 2025 (Arrival at store)",
        "📍 Location": "T. Nagar, Chennai", 
        "👤 Retailer Name": "VeggieMart Chennai"
      },
      detailedInfo: {
        "📦 Quantity": "290 kg after losses",
        "💰 Price": "₹40/kg retail rate",
        "📄 Contract Price": "₹30/kg (to distributor)",
        "🔗 Blockchain Hash": "0xcar789jkl012mno345pqr678stu901"
      }
    }
  ],
  "LOT22222": [
    {
      id: 1,
      title: "Farmer",
      icon: "🌾",
      date: "28 Aug 2025",
      location: "Nashik, Maharashtra",
      basicInfo: {
        "📅 Date": "28 Aug 2025 (Harvest date)",
        "📍 Location": "Nashik, Maharashtra",
        "👤 Farmer Name": "Kisan Singh"
      },
      detailedInfo: {
        "📦 Quantity": "400 kg",
        "💰 Price": "₹12/kg",
        "🔗 Lot ID": "LOT22222",
        "🔗 Blockchain Hash": "0xoni123def456ghi789jkl012mno345"
      }
    },
    {
      id: 2,
      title: "Retailer",
      icon: "🏪",
      date: "29 Aug 2025", 
      location: "Pune Central Market",
      basicInfo: {
        "📅 Date": "29 Aug 2025 (Arrival at market)",
        "📍 Location": "Pune Central Market", 
        "👤 Retailer Name": "Onion Traders Pune"
      },
      detailedInfo: {
        "📦 Quantity": "390 kg after sorting",
        "💰 Price": "₹28/kg retail rate",
        "📄 Storage": "Dry ventilated storage",
        "🔗 Blockchain Hash": "0xoni456ghi789jkl012mno345pqr678"
      }
    }
  ],
  "LOT33333": [
    {
      id: 1,
      title: "Farmer",
      icon: "🌾",
      date: "04 Sep 2025",
      location: "Bangalore, Karnataka",
      basicInfo: {
        "📅 Date": "04 Sep 2025 (Harvest date)",
        "📍 Location": "Bangalore, Karnataka",
        "👤 Farmer Name": "Tech Farms Pvt Ltd"
      },
      detailedInfo: {
        "📦 Quantity": "150 kg",
        "💰 Price": "₹25/kg",
        "🔗 Lot ID": "LOT33333",
        "🔗 Blockchain Hash": "0xpep123def456ghi789jkl012mno345"
      }
    },
    {
      id: 2,
      title: "Retailer",
      icon: "🏪",
      date: "05 Sep 2025", 
      location: "Whitefield, Bangalore",
      basicInfo: {
        "📅 Date": "05 Sep 2025 (Direct delivery)",
        "📍 Location": "Premium Mart, Whitefield", 
        "👤 Retailer Name": "Premium Mart"
      },
      detailedInfo: {
        "📦 Quantity": "148 kg after quality check",
        "💰 Price": "₹60/kg retail rate",
        "📄 Storage": "Refrigerated display",
        "🔗 Blockchain Hash": "0xpep456ghi789jkl012mno345pqr678"
      }
    }
  ]
};

export const reviewsDatabase = {
  "LOT12345": [
    {
      id: 1,
      name: "Priya Sharma",
      rating: 5,
      date: "06 Sep 2025",
      review: "Amazing quality tomatoes! The traceability feature gives me complete confidence in what I'm buying."
    },
    {
      id: 2,
      name: "Amit Patel",
      rating: 5,
      date: "05 Sep 2025",
      review: "Love the transparency! Being able to track from farm to store is incredible. Fresh and tasty."
    },
    {
      id: 3,
      name: "Sunita Desai",
      rating: 4,
      date: "05 Sep 2025",
      review: "Great initiative! The blockchain tracking shows the complete journey. Quality is excellent."
    }
  ],
  "LOT67890": [
    {
      id: 1,
      name: "Rajesh Kumar",
      rating: 5,
      date: "04 Sep 2025",
      review: "Fresh spinach with complete farm-to-fork traceability. Excellent quality and taste!"
    },
    {
      id: 2,
      name: "Meera Nair",
      rating: 4,
      date: "03 Sep 2025",
      review: "Very fresh and green. The blockchain tracking is a great feature for food safety."
    }
  ],
  "LOT11111": [
    {
      id: 1,
      name: "Karthik Raman",
      rating: 5,
      date: "02 Sep 2025",
      review: "Sweet and crunchy carrots from Ooty hills. Perfect for my family's meals!"
    },
    {
      id: 2,
      name: "Lakshmi Devi",
      rating: 5,
      date: "01 Sep 2025",
      review: "Mountain-grown carrots taste amazing. Love the transparency in the supply chain."
    }
  ],
  "LOT22222": [
    {
      id: 1,
      name: "Deepak Shah",
      rating: 4,
      date: "30 Aug 2025",
      review: "Good quality onions with long shelf life. Blockchain tracking adds trust factor."
    },
    {
      id: 2,
      name: "Anita Reddy",
      rating: 5,
      date: "29 Aug 2025",
      review: "Excellent onions from Nashik! The farm-to-table tracking is impressive."
    }
  ],
  "LOT33333": [
    {
      id: 1,
      name: "Rohan Mehta",
      rating: 5,
      date: "06 Sep 2025",
      review: "Premium bell peppers! Hydroponic farming ensures consistent quality. Worth the price."
    },
    {
      id: 2,
      name: "Kavya Nair",
      rating: 5,
      date: "05 Sep 2025",
      review: "Colorful and crisp! The controlled farming environment shows in the quality."
    }
  ]
};

// Helper functions
export const getProductData = (batchId) => {
  return productsDatabase[batchId] || productsDatabase["LOT12345"];
};

export const getTimelineData = (batchId) => {
  return timelineDatabase[batchId] || timelineDatabase["LOT12345"];
};

export const getReviewsData = (batchId) => {
  return reviewsDatabase[batchId] || reviewsDatabase["LOT12345"];
};

// Backward compatibility
export const productData = productsDatabase["LOT12345"];
export const timelineData = timelineDatabase["LOT12345"];
export const reviewsData = reviewsDatabase["LOT12345"];

// Get all products
export const getAllProducts = () => {
  return Object.keys(productsDatabase).map(batchId => ({
    batchId,
    ...productsDatabase[batchId]
  }));
};
