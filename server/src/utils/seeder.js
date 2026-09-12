import { Stock } from '../models/Stock.js';
import { Order } from '../models/Order.js';
import { Expense } from '../models/Expense.js';
import { User } from '../models/User.js';

export const initialStockData = [];
export const initialExpenseData = [];
export const initialOrderData = [];

export const seedDatabase = async () => {
  try {
    // Purge any legacy sample mock data created during initial development
    await Order.deleteMany({ billNumber: { $in: ['LF-01', 'LF-02', 'LF-03'] } });
    await Stock.deleteMany({
      sku: {
        $in: [
          'LUFO-SHI-LIN-01',
          'LUFO-TEE-OBS-02',
          'LUFO-TRO-PLE-03',
          'LUFO-DNM-RAW-04',
          'LUFO-BLZ-VLV-05',
          'LUFO-DRS-SLK-06',
          'LUFO-HUD-MON-07',
          'LUFO-ACC-BLT-08',
        ],
      },
    });
    await Expense.deleteMany({
      receiptNumber: {
        $in: ['REC-TEX-9921', 'RENT-SEP-2026', 'BLU-EXP-401', 'PKG-LUX-108', 'META-AD-884'],
      },
    });

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
  } catch (err) {
    console.warn(`Clean database / seed notice: ${err.message}`);
  }
};

