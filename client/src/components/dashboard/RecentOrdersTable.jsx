import React from 'react';
import { useApp } from '../../context/AppContext';
import { OrderStatusBadge } from '../orders/OrderStatusBadge';
import { Eye, ArrowRight } from 'lucide-react';
import { formatOrderNumber } from '../orders/OrderInvoiceModal';

export const RecentOrdersTable = ({ recentOrders = [] }) => {
  const { setActiveTab, setSelectedInvoiceOrder } = useApp();

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-slate-900">Recent Orders</h3>
        <button
          onClick={() => setActiveTab('orders')}
          className="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1 cursor-pointer"
        >
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="overflow-x-auto -mx-2 px-2">
        <table className="w-full text-left text-xs min-w-[420px]">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-semibold">
              <th className="pb-3">Order #</th>
              <th className="pb-3">Customer</th>
              <th className="pb-3 text-right">Amount</th>
              <th className="pb-3 text-center">Status</th>
              <th className="pb-3 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-slate-700">
            {recentOrders.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-6 text-center text-slate-400">
                  No orders yet.
                </td>
              </tr>
            ) : (
              recentOrders.map((order) => (
                <tr key={order._id} className="hover:bg-slate-50/50">
                  <td className="py-3 font-mono font-bold text-slate-900">#{formatOrderNumber(order.billNumber)}</td>
                  <td className="py-3 font-medium text-slate-700">{order.customer?.name}</td>
                  <td className="py-3 text-right font-mono font-bold text-slate-900">
                    ₹{(order.totalAmount || 0).toLocaleString()}
                  </td>
                  <td className="py-3 text-center">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => setSelectedInvoiceOrder(order)}
                      className="p-1 rounded text-slate-400 hover:text-slate-900"
                      title="View Bill"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
