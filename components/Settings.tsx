import React from 'react';
import Textarea from './common/Textarea';
import { AppSettings } from '../types';

interface SettingsProps {
    settings: AppSettings;
    onUpdateSettings: (settings: AppSettings) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onUpdateSettings }) => {
    
    const handleInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onUpdateSettings({ ...settings, paymentInstructions: e.target.value });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold text-gray-700 mb-6">General Settings</h2>
                
                <div className="space-y-6">
                    <div>
                        <h3 className="font-medium text-gray-800 mb-2">Organisation Logo</h3>
                        <div className="flex items-center space-x-4">
                             <div className="w-auto h-24 flex items-center justify-center border rounded-md bg-gray-50 p-2">
                                {settings.customLogo ? (
                                    <img src={settings.customLogo} alt="Custom Logo" className="max-w-full max-h-full object-contain" />
                                ) : (
                                    <span className="text-sm text-gray-400">No Logo</span>
                                )}
                            </div>
                        </div>
                    </div>
                     <div className="border-t border-gray-200 pt-6">
                        <h3 className="font-medium text-gray-800 mb-2">Payment Instructions</h3>
                        <p className="text-sm text-gray-500 mb-4">This text will appear at the bottom of all generated PDF invoices.</p>
                        <Textarea
                            label="Invoice Payment Details"
                            value={settings.paymentInstructions}
                            onChange={handleInstructionsChange}
                            rows={12}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;