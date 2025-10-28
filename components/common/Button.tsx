import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger' | 'icon';
    size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', className, ...props }) => {
    const baseClasses = "inline-flex items-center justify-center font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200";

    const variantClasses = {
        primary: "bg-[#004a97] text-white hover:bg-[#003b7a] focus:ring-[#004a97]",
        secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400",
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
        icon: "text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:ring-[#004a97]",
    };

    const sizeClasses = {
        sm: "px-2.5 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base",
    };
    
    const iconSizeClasses = {
        sm: "p-1.5",
        md: "p-2",
        lg: "p-2.5",
    }

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${variant === 'icon' ? iconSizeClasses[size] : sizeClasses[size]} ${className || ''}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;