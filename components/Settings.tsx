import React, { useRef, useState } from 'react';
import Button from './common/Button';
import Textarea from './common/Textarea';
import { UploadIcon, TrashIcon } from './icons';
import { AppSettings } from '../types';

interface SettingsProps {
    settings: AppSettings;
    onUpdateSettings: (settings: AppSettings) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onUpdateSettings }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string | null>(null);
    
    const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            setError("File size cannot exceed 2MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            onUpdateSettings({ ...settings, customLogo: reader.result as string });
        };
        reader.onerror = () => {
            setError("Failed to read file.");
        };
        reader.readAsDataURL(file);
    };

    const triggerFileUpload = () => {
        fileInputRef.current?.click();
    };
    
    const handleRemoveLogo = () => {
        onUpdateSettings({ ...settings, customLogo: null });
    }

    const handleInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onUpdateSettings({ ...settings, paymentInstructions: e.target.value });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold text-gray-700 mb-6">General Settings</h2>
                
                <div className="space-y-6">
                    <div>
                        <h3 className="font-medium text-gray-800 mb-2">Custom Logo</h3>
                        <p className="text-sm text-gray-500 mb-4">Upload a logo to brand the portal and invoices. Recommended size: 200x50 pixels. Max file size: 2MB.</p>
                        <div className="flex items-center space-x-4">
                             <div className="w-48 h-24 flex items-center justify-center border rounded-md bg-gray-50 p-2">
                                {settings.customLogo ? (
                                    <img src={settings.customLogo} alt="Custom Logo" className="max-w-full max-h-full object-contain" />
                                ) : (
                                    <span className="text-sm text-gray-400">No Logo</span>
                                )}
                            </div>
                            <div className="flex space-x-2">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleLogoUpload}
                                    className="hidden"
                                    accept="image/png, image/jpeg, image/svg+xml"
                                />
                                <Button type="button" onClick={triggerFileUpload} variant="secondary">
                                    <UploadIcon className="mr-2" />
                                    Upload Logo
                                </Button>
                                {settings.customLogo && (
                                    <Button type="button" onClick={handleRemoveLogo} variant="danger">
                                        <TrashIcon className="mr-2" />
                                        Remove
                                    </Button>
                                )}
                            </div>
                        </div>
                         {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
                    </div>
                     <div className="border-t border-gray-200 pt-6">
                        <h3 className="font-medium text-gray-800 mb-2">Payment Instructions</h3>
                        <p className="text-sm text-gray-500 mb-4">This text will appear at the bottom of all generated PDF invoices.</p>
                        <Textarea
                            label="Invoice Payment Details"
                            value={settings.paymentInstructions}
                            onChange={handleInstructionsChange}
                            rows={8}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
