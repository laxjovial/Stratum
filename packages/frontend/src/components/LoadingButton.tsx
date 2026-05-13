'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  children: React.ReactNode;
}

export const LoadingButton = ({ 
  isLoading, 
  children, 
  className = '', 
  disabled, 
  ...props 
}: LoadingButtonProps) => {
  return (
    <button
      disabled={isLoading || disabled}
      className={`w-full h-[46px] flex items-center justify-center px-4 py-2 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-md hover:shadow-lg ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin opacity-80" />
      ) : (
        children
      )}
    </button>
  );
};
