import React from 'react';
import { MenuIcon } from './icons';
import Button from './common/Button';

interface HeaderProps {
    title: string;
    onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onToggleSidebar }) => {
    return (
        <header className="bg-white shadow-sm z-10 flex-shrink-0">
            <div className="container mx-auto px-4 sm:px-6 md:px-8 py-3 flex items-center">
                 <Button onClick={onToggleSidebar} variant="icon" className="mr-4 lg:hidden">
                    <MenuIcon className="w-6 h-6" />
                </Button>
                <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            </div>
        </header>
    );
};

export default Header;