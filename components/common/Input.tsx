import React, { useState } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  textarea?: boolean;
  rows?: number;
  labelTheme?: 'light' | 'dark';
}

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a10.007 10.007 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.007 10.007 0 01-2.293 4.207" />
    </svg>
);


const Input: React.FC<InputProps> = ({ label, id, error, className, type, textarea, rows = 3, labelTheme = 'light', ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  const baseClasses = `w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:text-sm placeholder:text-gray-400 disabled:opacity-70 disabled:cursor-not-allowed ${error ? 'border-red-500' : ''} ${className || ''}`;

  const themeClasses = labelTheme === 'light' 
    ? 'bg-white text-black border border-gray-300 disabled:opacity-100 disabled:bg-white disabled:text-black' 
    : 'bg-slate-900/50 text-white border border-white/30 placeholder:text-gray-400';
    
  const labelClasses = labelTheme === 'light' ? "text-gray-700" : "text-gray-200";

  return (
    <div className="w-full">
      {label && <label htmlFor={id} className={`block text-sm font-medium ${labelClasses} mb-1`}>{label}</label>}
      <div className="relative">
        {textarea ? (
             <textarea
                id={id}
                className={`${baseClasses} ${themeClasses}`}
                rows={rows}
                {...(props as any)}
             />
        ) : (
            <>
                <input
                id={id}
                type={isPassword && showPassword ? 'text' : type}
                className={`${baseClasses} ${themeClasses} ${isPassword ? 'pr-10' : ''}`}
                {...props}
                />
                {isPassword && (
                <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 disabled:cursor-not-allowed"
                    onClick={() => setShowPassword(prev => !prev)}
                    disabled={props.disabled}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
                )}
            </>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
};

export default Input;