import React from 'react';
import { Badge } from '../common/Badge';

export const OrderStatusBadge = ({ status }) => {
  const config = {
    Pending: { variant: 'amber', label: 'Pending' },
    Processing: { variant: 'blue', label: 'Processing' },
    Shipped: { variant: 'purple', label: 'Shipped' },
    Delivered: { variant: 'emerald', label: 'Delivered' },
    Cancelled: { variant: 'rose', label: 'Cancelled' },
  };

  const current = config[status] || { variant: 'default', label: status };

  return (
    <Badge variant={current.variant} size="sm">
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          current.variant === 'emerald'
            ? 'bg-emerald-400'
            : current.variant === 'amber'
            ? 'bg-amber-400'
            : current.variant === 'blue'
            ? 'bg-blue-400'
            : current.variant === 'purple'
            ? 'bg-purple-400'
            : current.variant === 'rose'
            ? 'bg-rose-400'
            : 'bg-slate-400'
        }`}
      />
      {current.label}
    </Badge>
  );
};
