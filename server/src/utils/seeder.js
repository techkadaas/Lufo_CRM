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

    // Seed staff user arapsa@lufo.com if not exists
    const arapsaUser = await User.findOne({ username: 'arapsa@lufo.com' });
    if (!arapsaUser) {
      console.log('Seeding staff account (arapsa@lufo.com)...');
      await User.create({
        name: 'Arapsa',
        username: 'arapsa@lufo.com',
        password: 'Arapsa@lufo2',
        role: 'staff',
        isActive: true,
      });
      console.log('Staff account (arapsa@lufo.com) created successfully.');
    }

    // Seed staff user najeer@lufo.com if not exists
    const najeerUser = await User.findOne({ username: 'najeer@lufo.com' });
    if (!najeerUser) {
      console.log('Seeding staff account (najeer@lufo.com)...');
      await User.create({
        name: 'Najeer',
        username: 'najeer@lufo.com',
        password: 'Najeer@lufo4',
        role: 'staff',
        isActive: true,
      });
      console.log('Staff account (najeer@lufo.com) created successfully.');
    }
  } catch (err) {
    console.warn(`Clean database / seed notice: ${err.message}`);
  }
};

