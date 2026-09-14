import mongoose from 'mongoose';

const partnerIncomeSchema = new mongoose.Schema(
  {
    partnerId: {
      type: String,
      required: [true, 'Partner ID is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    paymentMode: {
      type: String,
      enum: ['UPI', 'Cash', 'Bank Transfer', 'Cheque', 'Other'],
      default: 'UPI',
    },
    purpose: {
      type: String,
      default: 'General Business Purchase / Capital Inflow',
      trim: true,
    },
    referenceNo: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const PartnerIncome = mongoose.models.PartnerIncome || mongoose.model('PartnerIncome', partnerIncomeSchema);
