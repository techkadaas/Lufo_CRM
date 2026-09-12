import React from 'react';
import { ExpenseList } from '../components/expenses/ExpenseList';

export const ExpensesPage = () => {
  return (
    <div className="space-y-6 pb-12">
      <ExpenseList />
    </div>
  );
};
