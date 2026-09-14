import { Order } from '../models/Order.js';

let fallbackCounter = 0;

export const generateBillNumber = async () => {
  try {
    // Find all existing order numbers to accurately find the max sequence
    const orders = await Order.find({}, { billNumber: 1 }).lean();

    let maxSequence = 0;

    if (orders && orders.length > 0) {
      for (const ord of orders) {
        if (ord.billNumber) {
          const match = String(ord.billNumber).match(/\d+/g);
          if (match) {
            const seq = parseInt(match[match.length - 1], 10);
            if (!isNaN(seq) && seq > maxSequence) {
              maxSequence = seq;
            }
          }
        }
      }
    }

    let candidateSeq = maxSequence + 1;
    const formatSeq = (num) => String(num).padStart(2, '0');
    let candidateNumber = formatSeq(candidateSeq);

    // Safety check against any race condition or duplicate
    while (await Order.exists({ billNumber: candidateNumber })) {
      candidateSeq += 1;
      candidateNumber = formatSeq(candidateSeq);
    }

    return candidateNumber;
  } catch (error) {
    fallbackCounter += 1;
    return String(fallbackCounter).padStart(2, '0');
  }
};
