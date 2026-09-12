import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  stockId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stock',
    required: false,
  },
  name: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
    default: '',
  },
  size: {
    type: String,
    default: 'M',
  },
  color: {
    type: String,
    default: 'Standard',
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
});

const orderSchema = new mongoose.Schema(
  {
    billNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    customer: {
      name: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true,
      },
      phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
      },
      address: {
        type: String,
        trim: true,
        default: '',
      },
      email: {
        type: String,
        trim: true,
        default: '',
      },
    },
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxRate: {
      type: Number,
      default: 0, // e.g. 5% or 12%
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'UPI', 'Credit/Debit Card', 'Bank Transfer', 'Store Credit'],
      default: 'UPI',
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Pending', 'Partial', 'Refunded'],
      default: 'Paid',
    },
    notes: {
      type: String,
      default: '',
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
