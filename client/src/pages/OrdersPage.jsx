import React from 'react';
import { useApp } from '../context/AppContext';
import { OrderList } from '../components/orders/OrderList';
import { CreateOrderModal } from '../components/orders/CreateOrderModal';

export const OrdersPage = () => {
  const { isCreateOrderOpen, setIsCreateOrderOpen } = useApp();

  return (
    <div className="space-y-6 pb-12">
      <OrderList />

      {isCreateOrderOpen && (
        <CreateOrderModal
          isOpen={isCreateOrderOpen}
          onClose={() => setIsCreateOrderOpen(false)}
        />
      )}
    </div>
  );
};
