import mongoose, { Schema } from 'mongoose';

const loanRequestSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    bankId: {
      type: String,
      required: true
    },
    bankName: {
      type: String,
      required: true
    },
    requestedAmount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    remarks: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true,
  }
);

export const LoanRequest = mongoose.model("LoanRequest", loanRequestSchema);
