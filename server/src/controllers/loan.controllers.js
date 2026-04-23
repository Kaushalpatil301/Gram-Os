import { LoanRequest } from '../models/loan.models.js';
import { ApiError } from '../utils/api-error.js';
import { ApiResponse } from '../utils/api-response.js';

const MOCK_BANKS = [
  { id: "b1", name: "State Bank of India (SBI)", interestRate: 7.0, maxLoanAmount: 500000, logo: "🏦" },
  { id: "b2", name: "HDFC Bank", interestRate: 8.5, maxLoanAmount: 1000000, logo: "💸" },
  { id: "b3", name: "ICICI Bank", interestRate: 8.2, maxLoanAmount: 800000, logo: "💳" },
  { id: "b4", name: "Gramin Bank", interestRate: 6.5, maxLoanAmount: 300000, logo: "🌾" },
  { id: "b5", name: "NABARD", interestRate: 5.5, maxLoanAmount: 1500000, logo: "🌱" }
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
