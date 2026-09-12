import { Stock } from '../models/Stock.js';
import { Order } from '../models/Order.js';
import { Expense } from '../models/Expense.js';

export const initialStockData = [
  {
    name: 'LUFO Atelier Linen Classic Shirt',
    sku: 'LUFO-SHI-LIN-01',
    category: 'Shirts',
    size: 'L',
    color: 'Ivory Cream',
    fabric: 'Pure French Linen',
    costPrice: 1200,
    sellingPrice: 2899,
    quantity: 24,
    lowStockThreshold: 5,
    description: 'Breathable handcrafted linen shirt tailored for relaxed luxury.',
  },
  {
    name: 'LUFO Obsidian Heavyweight Oversized Tee',
    sku: 'LUFO-TEE-OBS-02',
    category: 'T-Shirts',
    size: 'XL',
    color: 'Midnight Black',
    fabric: '280 GSM Supima Cotton',
    costPrice: 450,
    sellingPrice: 1499,
    quantity: 42,
    lowStockThreshold: 8,
    description: 'Ultra-dense premium drop-shoulder tee with reinforced collar.',
  },
  {
    name: 'LUFO Sartorial Pleated Trousers',
    sku: 'LUFO-TRO-PLE-03',
    category: 'Trousers',
    size: 'M',
    color: 'Charcoal Grey',
    fabric: 'Wool Blend',
    costPrice: 1400,
    sellingPrice: 3499,
    quantity: 4, // low stock trigger
    lowStockThreshold: 6,
    description: 'Double pleat front with side adjusters and tapered drape.',
  },
  {
    name: 'LUFO Raw Selvedge Japanese Denim',
    sku: 'LUFO-DNM-RAW-04',
    category: 'Denim',
    size: 'L',
    color: 'Deep Indigo',
    fabric: '14oz Kurabo Selvedge Denim',
    costPrice: 1800,
    sellingPrice: 4299,
    quantity: 18,
    lowStockThreshold: 5,
    description: 'Unwashed rigid raw selvedge with chainstitch hem.',
  },
  {
    name: 'LUFO Velvet Lapel Tuxedo Blazer',
    sku: 'LUFO-BLZ-VLV-05',
    category: 'Jackets & Blazers',
    size: 'L',
    color: 'Emerald Green',
    fabric: 'Italian Cotton Velvet',
    costPrice: 3200,
    sellingPrice: 8999,
    quantity: 3, // low stock
    lowStockThreshold: 5,
    description: 'Statement evening jacket with satin peak lapels and structured shoulder.',
  },
  {
    name: 'LUFO Silk Blend Wrap Evening Dress',
    sku: 'LUFO-DRS-SLK-06',
    category: 'Dresses',
    size: 'S',
    color: 'Burgundy Wine',
    fabric: 'Mulberry Silk & Viscose',
    costPrice: 2200,
    sellingPrice: 5999,
    quantity: 12,
    lowStockThreshold: 4,
    description: 'Flowy asymmetric silhouette with sash belt tie.',
  },
  {
    name: 'LUFO Monogram Heavy Zip Hoodie',
    sku: 'LUFO-HUD-MON-07',
    category: 'Hoodies & Sweatshirts',
    size: 'XL',
    color: 'Mocha Brown',
    fabric: '450 GSM French Terry',
    costPrice: 950,
    sellingPrice: 2699,
    quantity: 2, // low stock
    lowStockThreshold: 5,
    description: 'Luxury fleece lined hoodie with brushed gunmetal hardware.',
  },
  {
    name: 'LUFO Handcrafted Full-Grain Leather Belt',
    sku: 'LUFO-ACC-BLT-08',
    category: 'Accessories',
    size: 'Free Size',
    color: 'Cognac Tan',
    fabric: 'Full-Grain Italian Leather',
    costPrice: 600,
    sellingPrice: 1899,
    quantity: 30,
    lowStockThreshold: 5,
    description: 'Solid brass brushed buckle with custom debossed logo.',
  },
];

export const initialExpenseData = [
  {
    title: 'Autumn Collection Supima Cotton Roll Purchase',
    category: 'Raw Materials & Fabric',
    amount: 45000,
    paymentMethod: 'Bank Transfer',
    receiptNumber: 'REC-TEX-9921',
    notes: '200 meters of 280 GSM combed cotton fabric.',
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Boutique Showroom Monthly Lease',
    category: 'Store Rent & Maintenance',
    amount: 35000,
    paymentMethod: 'Bank Transfer',
    receiptNumber: 'RENT-SEP-2026',
    notes: 'Commercial rent for flagship studio.',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Express Courier & BlueDart Logistics',
    category: 'Logistics & Courier',
    amount: 6850,
    paymentMethod: 'UPI',
    receiptNumber: 'BLU-EXP-401',
    notes: 'Domestic shipping across tier-1 cities.',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Custom Velvet Garment Bags & Embossed Hangtags',
    category: 'Packaging & Tags',
    amount: 12400,
    paymentMethod: 'UPI',
    receiptNumber: 'PKG-LUX-108',
    notes: '500 custom luxury packaging boxes and gold foil tags.',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Instagram & Meta Fashion Campaign Ad Spend',
    category: 'Marketing & Ads',
    amount: 15000,
    paymentMethod: 'Credit Card',
    receiptNumber: 'META-AD-884',
    notes: 'ROAS campaign targeting luxury menswear & womenswear.',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
];

export const initialOrderData = [
  {
    billNumber: 'LF-01',
    customer: {
      name: 'Aarav Singhania',
      phone: '+91 98201 44521',
      address: 'Penthouse 4B, Skyview Towers, Worli, Mumbai - 400018',
      email: 'aarav.singhania@luxuryventures.in',
    },
    items: [
      {
        name: 'LUFO Velvet Lapel Tuxedo Blazer',
        sku: 'LUFO-BLZ-VLV-05',
        size: 'L',
        color: 'Emerald Green',
        price: 8999,
        quantity: 1,
        total: 8999,
      },
      {
        name: 'LUFO Sartorial Pleated Trousers',
        sku: 'LUFO-TRO-PLE-03',
        size: 'M',
        color: 'Charcoal Grey',
        price: 3499,
        quantity: 1,
        total: 3499,
      },
    ],
    subtotal: 12498,
    discount: 500,
    taxRate: 0,
    taxAmount: 0,
    totalAmount: 11998,
    status: 'Delivered',
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    notes: 'VIP Client - Include luxury ribbon gift pack.',
    orderDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    billNumber: 'LF-02',
    customer: {
      name: 'Meera Kapoor',
      phone: '+91 98112 87342',
      address: 'Villa 12, Golf Links Enclave, New Delhi - 110003',
      email: 'meera.kapoor@atelier.com',
    },
    items: [
      {
        name: 'LUFO Silk Blend Wrap Evening Dress',
        sku: 'LUFO-DRS-SLK-06',
        size: 'S',
        color: 'Burgundy Wine',
        price: 5999,
        quantity: 1,
        total: 5999,
      },
    ],
    subtotal: 5999,
    discount: 0,
    taxRate: 0,
    taxAmount: 0,
    totalAmount: 5999,
    status: 'Shipped',
    paymentMethod: 'Credit/Debit Card',
    paymentStatus: 'Paid',
    notes: 'Requested doorstep courier delivery before weekend.',
    orderDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    billNumber: 'LF-03',
    customer: {
      name: 'Rohan Deshmukh',
      phone: '+91 97654 32190',
      address: '802, Prestige Hermitage, Kensington Road, Bangalore - 560042',
      email: 'rohan.d@deshmukh.io',
    },
    items: [
      {
        name: 'LUFO Atelier Linen Classic Shirt',
        sku: 'LUFO-SHI-LIN-01',
        size: 'L',
        color: 'Ivory Cream',
        price: 2899,
        quantity: 2,
        total: 5798,
      },
      {
        name: 'LUFO Obsidian Heavyweight Oversized Tee',
        sku: 'LUFO-TEE-OBS-02',
        size: 'XL',
        color: 'Midnight Black',
        price: 1499,
        quantity: 2,
        total: 2998,
      },
    ],
    subtotal: 8796,
    discount: 300,
    taxRate: 0,
    taxAmount: 0,
    totalAmount: 8496,
    status: 'Processing',
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    notes: 'Check sleeve length before dispatch.',
    orderDate: new Date(),
  },
];

export const seedDatabase = async () => {
  try {
    const stockCount = await Stock.countDocuments();
    if (stockCount === 0) {
      await Stock.insertMany(initialStockData);
      console.log('📦 [Seed] Initial Stock items created.');
    }

    const expenseCount = await Expense.countDocuments();
    if (expenseCount === 0) {
      await Expense.insertMany(initialExpenseData);
      console.log('💸 [Seed] Initial Expense logs created.');
    }

    const orderCount = await Order.countDocuments();
    if (orderCount === 0) {
      await Order.insertMany(initialOrderData);
      console.log('🛍️ [Seed] Initial Orders created.');
    } else {
      // Migrate any legacy long bill numbers to short LF-XXXX format
      const oldOrders = await Order.find({ billNumber: { $regex: '^LUFO-ORD-' } });
      for (const ord of oldOrders) {
        const parts = ord.billNumber.split('-');
        const seq = parts[parts.length - 1];
        ord.billNumber = `LF-${seq}`;
        await ord.save();
      }
    }
  } catch (err) {
    console.warn(`Seed notice: ${err.message}`);
  }
};
