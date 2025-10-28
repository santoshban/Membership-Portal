import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

const Input: React.FC<InputProps> = ({ label, ...props }) => {
    return (
        <div>
            <label htmlFor={props.id || props.name} className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <input
                {...props}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#004a97] focus:border-[#004a97] sm:text-sm disabled:bg-gray-50 text-gray-900"
            />
        </div>
    );
};

export default Input;