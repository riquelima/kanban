
import React from 'react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  ariaLabel: string;
}

const IconButton: React.FC<IconButtonProps> = ({ children, ariaLabel, className, ...props }) => {
  return (
    <button
      aria-label={ariaLabel}
      className={`p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-[#3C3C43] focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default IconButton;
