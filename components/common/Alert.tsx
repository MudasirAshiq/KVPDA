import React from 'react';

interface AlertProps {
  message?: string;
  children?: React.ReactNode;
  variant: 'danger' | 'success' | 'warning';
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({ message, children, variant, onClose }) => {
  if (!message && !children) return null;

  const baseClasses = "p-4 rounded-md flex items-center justify-between text-sm";
  const variantClasses = {
    danger: 'bg-red-50 border border-red-300 text-red-800',
    success: 'bg-green-50 border border-green-300 text-green-800',
    warning: 'bg-yellow-50 border border-yellow-300 text-yellow-800',
  };

  const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  return (
    <div className={`${baseClasses} ${variantClasses[variant]}`} role="alert">
      {message ? <span>{message}</span> : children}
      {onClose && (
        <button onClick={onClose} className="ml-4 -mr-1 -my-1 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600">
          <span className="sr-only">Dismiss</span>
          <CloseIcon />
        </button>
      )}
    </div>
  );
};

export default Alert;