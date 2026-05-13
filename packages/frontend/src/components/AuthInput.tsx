'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
}

export const AuthInput = ({ label, error, type, className = '', ...props }: AuthInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full space-y-1.5">
      <label className="block text-sm font-semibold text-gray-700 ml-0.5">
        {label}
      </label>
      <div className="relative group">
        <input
          type={inputType}
          className={`w-full px-4 py-2.5 bg-white border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 placeholder:text-gray-400 ${
            error ? 'border-red-500 bg-red-50/30' : 'border-gray-200 hover:border-gray-300'
          } ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            title={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-blue-600 focus:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded-md transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            
            {/* Premium Tooltip */}
            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 group-focus-within:scale-100 transition-all duration-200 bg-gray-900 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none z-20 shadow-xl border border-white/10 backdrop-blur-sm">
              {showPassword ? 'HIDE' : 'SHOW'}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
            </span>
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-red-500 text-xs font-medium mt-1.5 ml-1 flex items-center animate-in fade-in slide-in-from-top-1">
          <span className="inline-block w-1 h-1 bg-red-500 rounded-full mr-1.5" />
          {error}
        </p>
      )}
    </div>
  );
};
