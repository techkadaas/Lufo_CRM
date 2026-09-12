import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Expense title is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Expense category is required'],
      enum: [
        'Raw Materials & Fabric',
        'Stitching & Tailoring',
        'Logistics & Courier',
        'Packaging & Tags',
        'Marketing & Ads',
        'Store Rent & Maintenance',
        'Staff & Salary',
        'Utilities & Electricity',
        'Software & Tools',
        'Miscellaneous',
      ],
      default: 'Raw Materials & Fabric',
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
    paymentMethod: {
      type: String,
      enum: ['Bank Transfer', 'UPI', 'Cash', 'Credit Card', 'Cheque'],
      default: 'UPI',
    },
    receiptNumber: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Expense = mongoose.models.Expense || mongoose.model('Expense', expenseSchema);
