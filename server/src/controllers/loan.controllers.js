import { LoanRequest } from '../models/loan.models.js';
import { ApiError } from '../utils/api-error.js';
import { ApiResponse } from '../utils/api-response.js';

const MOCK_BANKS = [
  { id: "b1", name: "State Bank of India (SBI)", interestRate: 7.0, maxLoanAmount: 500000, logo: "🏦", minScore: 500, allowedRoles: ["farmer", "retailer"], type: "growth", description: "Long-term expansion loan for business growth.", applyLink: "https://sbi.co.in/web/agri-rural/agriculture-banking" },
  { id: "b2", name: "HDFC SmartAgri", interestRate: 8.5, maxLoanAmount: 1000000, logo: "💸", minScore: 650, allowedRoles: ["farmer", "retailer"], type: "growth", description: "Premium machinery and infrastructure financing.", applyLink: "https://www.hdfcbank.com/personal/borrow/popular-loans/rural-loans" },
  { id: "b3", name: "BharatPe QR Cash", interestRate: 11.2, maxLoanAmount: 200000, logo: "📱", minScore: 550, allowedRoles: ["retailer"], type: "qr", description: "Instant cash advance based on your daily QR transactions.", applyLink: "https://bharatpe.com/loans" },
  { id: "b4", name: "Gramin Bank", interestRate: 6.5, maxLoanAmount: 300000, logo: "🌾", minScore: 300, allowedRoles: ["farmer", "villager"], type: "standard", description: "Standard community support loan.", applyLink: "https://nationalbank.co.in" },
  { id: "b5", name: "NABARD Kisan Scheme", interestRate: 5.5, maxLoanAmount: 1500000, logo: "🌱", minScore: 400, allowedRoles: ["farmer"], type: "growth", description: "Govt-subsidized crop and land expansion loan.", applyLink: "https://www.nabard.org/" },
  { id: "b6", name: "Paytm Merchant Loan", interestRate: 12.0, maxLoanAmount: 500000, logo: "💳", minScore: 450, allowedRoles: ["retailer", "villager"], type: "qr", description: "Daily installment loan based on UPI QR history.", applyLink: "https://paytm.com/business/loans" },
  { id: "b7", name: "Village Co-op Society", interestRate: 4.5, maxLoanAmount: 50000, logo: "🤝", minScore: 200, allowedRoles: ["villager", "farmer"], type: "standard", description: "Small, trust-based micro-loan for quick needs.", applyLink: "https://sahakarabhavana.gov.in/" },
];

export const getBanks = async (req, res, next) => {
  try {
    res.status(200).json(new ApiResponse(200, MOCK_BANKS, "Banks fetched successfully"));
  } catch (error) {
    next(error);
  }
};

export const requestLoan = async (req, res, next) => {
  try {
    const { banks, requestedAmount } = req.body;
    // req.user might not be available if not authenticated, we will pass userId for now or use a mock user ID
    const userId = req.user?._id || req.body.userId; 

    if (!userId) {
      return next(new ApiError(401, "Unauthorized: User ID is required."));
    }

    if (!banks || !Array.isArray(banks) || banks.length === 0) {
      return next(new ApiError(400, "At least one bank must be selected."));
    }

    if (!requestedAmount || requestedAmount <= 0) {
      return next(new ApiError(400, "Invalid requested amount."));
    }

    const loanRequests = banks.map(bankId => {
      const bank = MOCK_BANKS.find(b => b.id === bankId);
      return {
        userId,
        bankId,
        bankName: bank ? bank.name : "Unknown Bank",
        requestedAmount,
        status: 'pending'
      };
    });

    const createdRequests = await LoanRequest.insertMany(loanRequests);

    res.status(201).json(new ApiResponse(201, createdRequests, "Loan requests submitted successfully"));
  } catch (error) {
    next(error);
  }
};

export const simulateBankAction = async (req, res, next) => {
  try {
    const { requestId, action } = req.body; // action: 'accepted' or 'rejected'
    
    if (!['accepted', 'rejected'].includes(action)) {
      return next(new ApiError(400, "Action must be either 'accepted' or 'rejected'"));
    }

    const request = await LoanRequest.findById(requestId);
    if (!request) {
      return next(new ApiError(404, "Loan request not found"));
    }

    request.status = action;
    const isMockAccepted = action === 'accepted';
    request.remarks = isMockAccepted ? "Congratulations! Your credit profile matched our requirements." : "Sorry, your profile does not meet our minimum requirements currently.";
    await request.save();

    res.status(200).json(new ApiResponse(200, request, `Loan request simulation action: ${action}`));
  } catch (error) {
    next(error);
  }
};

export const getLoanRequests = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.query.userId;
    if (!userId) {
      return next(new ApiError(401, "Unauthorized: User ID is required."));
    }

    const requests = await LoanRequest.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(200, requests, "Loan requests fetched successfully"));
  } catch (error) {
    next(error);
  }
};
