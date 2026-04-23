// Mock data for transaction history
export const mockTransactions = [
  {
    id: 1,
    productName: "Organic Tomatoes",
    date: "2024-01-15",
    warranty: "Active",
    origin: "Farm Valley Co.",
    qrData: "AGRI-1705123456789",
    timestamp: "2024-01-15 14:30:25"
  },
  {
    id: 2,
    productName: "Free-Range Eggs",
    date: "2024-01-12",
    warranty: "Active",
    origin: "Sunrise Poultry",
    qrData: "AGRI-1704987654321",
    timestamp: "2024-01-12 09:15:10"
  },
  {
    id: 3,
    productName: "Grass-Fed Beef",
    date: "2024-01-08",
    warranty: "Expired",
    origin: "Green Pastures Ranch",
    qrData: "AGRI-1704456789123",
    timestamp: "2024-01-08 16:45:30"
  }
];

// Function to add new scan
export const addNewScan = (scanData) => {
  const newScan = {
    id: Date.now(),
    ...scanData,
    timestamp: new Date().toLocaleString()
  };
  
  // In a real app, this would be an API call
  mockTransactions.unshift(newScan);
  return newScan;
};

// Local storage management
export const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const getFromLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

// Mock API functions
export const verifyProduct = async (qrData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock verification logic
  const isValid = Math.random() > 0.1; // 90% success rate
  
  if (!isValid) {
    throw new Error('Product verification failed');
  }
  
  return {
    verified: true,
    product: {
      name: `Product ${qrData.split('-')[1]}`,
      origin: 'Verified Farm Co.',
      status: Math.random() > 0.3 ? 'Active' : 'Expired',
      certifications: ['USDA Organic', 'Fair Trade'],
      harvestDate: new Date().toISOString().split('T')[0]
    }
  };
};

export const submitIssueReport = async (reportData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const reportId = `REP-${Date.now()}`;
  
  // In a real app, this would send to backend
  const report = {
    id: reportId,
    ...reportData,
    status: 'Submitted',
    createdAt: new Date().toISOString()
  };
  
  // Save to local storage for demo
  const existingReports = getFromLocalStorage('issueReports', []);
  existingReports.push(report);
  saveToLocalStorage('issueReports', existingReports);
  
  return { reportId, status: 'success' };
};
