
import React from 'react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  ariaLabel: string;
}

const IconButton: React.FC<IconButtonProps> = ({ children, ariaLabel, className, ...props }) => {
  return (
    <button
      aria-label={ariaLabel}
      className={`p-2 rounded-md hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default IconButton;
    