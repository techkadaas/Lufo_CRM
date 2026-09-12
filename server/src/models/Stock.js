import mongoose from 'mongoose';

const stockSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Shirts', 'T-Shirts', 'Trousers', 'Denim', 'Jackets & Blazers', 'Dresses', 'Hoodies & Sweatshirts', 'Accessories'],
      default: 'Shirts',
    },
    size: {
      type: String,
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size'],
      default: 'M',
    },
    color: {
      type: String,
      required: true,
      default: 'Black',
    },
    fabric: {
      type: String,
      default: 'Cotton Blend',
    },
    costPrice: {
      type: Number,
      required: [true, 'Cost price is required'],
      min: 0,
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
    },
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Stock = mongoose.models.Stock || mongoose.model('Stock', stockSchema);
