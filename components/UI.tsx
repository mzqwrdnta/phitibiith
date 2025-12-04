import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  isLoading?: boolean;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  icon,
  className = '',
  size = 'md',
  ...props 
}) => {
  const baseStyle = "flex items-center justify-center gap-2 rounded-full font-bold transition-all transform active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-6 py-3",
    lg: "px-8 py-4 text-lg"
  };

  const variants = {
    primary: "bg-pink-500 hover:bg-pink-600 text-white shadow-pink-200",
    secondary: "bg-white text-pink-500 border-2 border-pink-100 hover:border-pink-300",
    danger: "bg-red-500 hover:bg-red-600 text-white",
    ghost: "bg-transparent hover:bg-pink-50 text-pink-600",
    outline: "bg-transparent border-2 border-gray-200 text-gray-600 hover:border-gray-400"
  };

  return (
    <button 
      className={`${baseStyle} ${sizeStyles[size]} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      ) : icon}
      {children}
    </button>
  );
};

export const IconButton: React.FC<ButtonProps> = ({ className = '', ...props }) => {
    return (
        <Button 
            className={`!p-2 aspect-square !rounded-xl ${className}`} 
            {...props} 
        />
    )
}