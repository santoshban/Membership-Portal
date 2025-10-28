
import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, ...props }) => {
    return (
        <div>
            <label htmlFor={props.id || props.name} className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <textarea
                {...props}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
        </div>
    );
};

export default Textarea;
