import { Order } from '../models/Order.js';

let mockCounter = 0;

export const generateBillNumber = async () => {
  const prefix = 'LF';

  try {
    // Find all existing order bill numbers to accurately find the max sequence
    const orders = await Order.find({}, { billNumber: 1 }).lean();

    let maxSequence = 0;

    if (orders && orders.length > 0) {
      for (const ord of orders) {
        if (ord.billNumber) {
          const parts = ord.billNumber.split('-');
          const seq = parseInt(parts[parts.length - 1], 10);
          if (!isNaN(seq) && seq > maxSequence) {
            maxSequence = seq;
          }
        }
      }
    }

    let candidateSeq = maxSequence + 1;
    const formatSeq = (num) => String(num).padStart(2, '0');
    let candidateBillNumber = `${prefix}-${formatSeq(candidateSeq)}`;

    // Safety check against any race condition or duplicate
    while (await Order.exists({ billNumber: candidateBillNumber })) {
      candidateSeq += 1;
      candidateBillNumber = `${prefix}-${formatSeq(candidateSeq)}`;
    }

    return candidateBillNumber;
  } catch (error) {
    mockCounter += 1;
    return `${prefix}-${String(mockCounter).padStart(2, '0')}`;
  }
};
