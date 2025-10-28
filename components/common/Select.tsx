import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    children: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({ label, children, ...props }) => {
    return (
        <div>
            <label htmlFor={props.id || props.name} className="block text-sm font-medium text-gray-700">
                {label}
            </label>
            <select
                {...props}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white border border-gray-300 focus:outline-none focus:ring-[#004a97] focus:border-[#004a97] sm:text-sm rounded-md disabled:bg-gray-50 text-gray-900"
            >
                {children}
            </select>
        </div>
    );
};

export default Select;