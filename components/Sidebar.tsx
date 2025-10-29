import React from 'react';
import { Page } from '../types';
import { HomeIcon, UsersIcon, SettingsIcon, LogOutIcon, UserCircleIcon } from './icons';

interface SidebarProps {
    currentPage: Page;
    onNavigate: (page: Page) => void;
    onLogout: () => void;
    isCollapsed: boolean;
    logo: string | null;
}

const NavLink: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
    isCollapsed: boolean;
}> = ({ icon, label, isActive, onClick, isCollapsed }) => (
    <button
        onClick={onClick}
        title={isCollapsed ? label : ''}
        className={`flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-md transition-colors duration-200 ${
            isActive
                ? 'bg-[#004a97] text-white shadow'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        } ${isCollapsed ? 'justify-center' : ''}`}
    >
        <span className={isCollapsed ? '' : 'mr-4'}>{icon}</span>
        {!isCollapsed && label}
    </button>
);


const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, onLogout, isCollapsed, logo }) => {
    return (
        <aside className={`fixed top-0 left-0 h-full bg-white text-gray-800 flex flex-col p-4 transition-all duration-300 z-20 border-r border-gray-200 ${isCollapsed ? 'w-20' : 'w-64'}`}>
            <div className={`mb-8 flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
                {logo ? (
                    <img src={logo} alt="Logo" className={`h-10 object-contain ${isCollapsed ? 'w-16' : 'w-auto'}`} />
                ) : (
                    !isCollapsed && (
                        <div>
                             <h1 className="text-2xl font-bold text-gray-800">ECCNSW</h1>
                             <p className="text-xs text-gray-500">Membership Platform</p>
                        </div>
                    )
                )}
            </div>
            <nav className="flex-1 space-y-2">
                <NavLink 
                    icon={<HomeIcon className="w-5 h-5"/>} 
                    label="Dashboard" 
                    isActive={currentPage === 'DASHBOARD'}
                    onClick={() => onNavigate('DASHBOARD')}
                    isCollapsed={isCollapsed}
                />
                <NavLink 
                    icon={<UsersIcon className="w-5 h-5"/>} 
                    label="Members" 
                    isActive={currentPage === 'MEMBERS'}
                    onClick={() => onNavigate('MEMBERS')}
                    isCollapsed={isCollapsed}
                />
                 <NavLink 
                    icon={<SettingsIcon className="w-5 h-5"/>} 
                    label="Levels" 
                    isActive={currentPage === 'LEVELS'}
                    onClick={() => onNavigate('LEVELS')}
                    isCollapsed={isCollapsed}
                />
            </nav>
            <div className="mt-auto space-y-2">
                <NavLink 
                    icon={<SettingsIcon className="w-5 h-5"/>} 
                    label="Settings" 
                    isActive={currentPage === 'SETTINGS'}
                    onClick={() => onNavigate('SETTINGS')}
                    isCollapsed={isCollapsed}
                />
                <NavLink 
                    icon={<UserCircleIcon className="w-5 h-5"/>} 
                    label="Profile" 
                    isActive={currentPage === 'PROFILE'}
                    onClick={() => onNavigate('PROFILE')}
                    isCollapsed={isCollapsed}
                />
                <NavLink 
                    icon={<LogOutIcon className="w-5 h-5"/>} 
                    label="Logout" 
                    isActive={false}
                    onClick={onLogout}
                    isCollapsed={isCollapsed}
                />
            </div>
        </aside>
    );
};

export default Sidebar;