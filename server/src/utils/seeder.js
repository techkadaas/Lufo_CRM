import { Stock } from '../models/Stock.js';
import { Order } from '../models/Order.js';
import { Expense } from '../models/Expense.js';
import { User } from '../models/User.js';

export const initialStockData = [];
export const initialExpenseData = [];
export const initialOrderData = [
  {
    billNumber: '02',
    customer: {
      name: 'Ibrahim',
      phone: '7845620560',
      address: '',
      email: '',
    },
    items: [
      {
        name: 'Lufo Clothing Item',
        price: 300,
        quantity: 1,
        total: 300,
      },
    ],
    subtotal: 300,
    discount: 0,
    taxRate: 0,
    taxAmount: 0,
    totalAmount: 300,
    status: 'Pending',
    createdAt: new Date().toISOString(),
  },
  {
    billNumber: '05',
    customer: {
      name: 'Samath (Thoufiq)',
      phone: '9629515440',
      address: '',
      email: '',
    },
    items: [
      {
        name: 'Lufo Clothing Item',
        price: 400,
        quantity: 1,
        total: 400,
      },
    ],
    subtotal: 400,
    discount: 0,
    taxRate: 0,
    taxAmount: 0,
    totalAmount: 400,
    status: 'Pending',
    createdAt: new Date().toISOString(),
  },
  {
    billNumber: '03',
    customer: {
      name: 'Dhanush',
      phone: '7806936674',
      address: '',
      email: '',
    },
    items: [
      {
        name: 'Lufo Clothing Item 1',
        price: 364,
        quantity: 1,
        total: 364,
      },
      {
        name: 'Lufo Clothing Item 2',
        price: 364,
        quantity: 1,
        total: 364,
      },
    ],
    subtotal: 728,
    discount: 0,
    taxRate: 0,
    taxAmount: 0,
    totalAmount: 728,
    status: 'Pending',
    createdAt: new Date().toISOString(),
  },
];

export const seedDatabase = async () => {
  try {
    // Seed default admin account if no user exists
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      console.log('Seeding initial admin account (ahamed@LufoClothing)...');
      await User.create({
        name: 'Ahamed (Admin)',
        username: 'ahamed@lufoclothing',
        password: 'ahamed@lufo0987',
        role: 'admin',
        isActive: true,
      });
      console.log('Admin account created successfully.');
    }

    // Seed staff user riyas@lufo.com if not exists
    const riyasUser = await User.findOne({ username: 'riyas@lufo.com' });
    if (!riyasUser) {
      console.log('Seeding staff account (riyas@lufo.com)...');
      await User.create({
        name: 'Riyas',
        username: 'riyas@lufo.com',
        password: 'Riyas@lufo3',
        role: 'staff',
        isActive: true,
      });
      console.log('Staff account (riyas@lufo.com) created successfully.');
    }

    // Ensure production orders are in the database so all devices (mobile & laptop) see all orders
    const existing02 = await Order.findOne({ billNumber: { $in: ['02', 'LF-02'] } });
    if (!existing02) {
      await Order.create({
        billNumber: '02',
        customer: {
          name: 'Ibrahim',
          phone: '7845620560',
          address: '',
          email: '',
        },
        items: [
          {
            name: 'Lufo Clothing Item',
            price: 300,
            quantity: 1,
            total: 300,
          },
        ],
        subtotal: 300,
        discount: 0,
        taxRate: 0,
        taxAmount: 0,
        totalAmount: 300,
        status: 'Pending',
      });
    }

    const existing05 = await Order.findOne({ billNumber: { $in: ['05', 'LF-05'] } });
    if (!existing05) {
      await Order.create({
        billNumber: '05',
        customer: {
          name: 'Samath (Thoufiq)',
          phone: '9629515440',
          address: '',
          email: '',
        },
        items: [
          {
            name: 'Lufo Clothing Item',
            price: 400,
            quantity: 1,
            total: 400,
          },
        ],
        subtotal: 400,
        discount: 0,
        taxRate: 0,
        taxAmount: 0,
        totalAmount: 400,
        status: 'Pending',
      });
    }

    const existing03 = await Order.findOne({ billNumber: { $in: ['03', 'LF-03'] } });
    if (!existing03) {
      await Order.create({
        billNumber: '03',
        customer: {
          name: 'Dhanush',
          phone: '7806936674',
          address: '',
          email: '',
        },
        items: [
          {
            name: 'Lufo Clothing Item 1',
            price: 364,
            quantity: 1,
            total: 364,
          },
          {
            name: 'Lufo Clothing Item 2',
            price: 364,
            quantity: 1,
            total: 364,
          },
        ],
        subtotal: 728,
        discount: 0,
        taxRate: 0,
        taxAmount: 0,
        totalAmount: 728,
        status: 'Pending',
      });
    }
  } catch (err) {
    console.warn(`Seed database notice: ${err.message}`);
  }
};

