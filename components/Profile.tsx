import React, { useState, useEffect, useRef } from 'react';
import { AdminProfileData } from '../types';
import Input from './common/Input';
import Button from './common/Button';
import { DownloadIcon, UploadIcon } from './icons';

interface ProfileProps {
    adminProfile: AdminProfileData;
    onUpdateAdminProfile: (data: AdminProfileData) => void;
    currentPassword: string;
    onUpdatePassword: (newPassword: string) => void;
    loginTimestamps: string[];
    logoutTimestamps: string[];
    onResetData: () => void;
    onExportData: () => void;
    onImportData: (fileContent: string) => void;
}

const Profile: React.FC<ProfileProps> = ({
    adminProfile,
    onUpdateAdminProfile,
    currentPassword,
    onUpdatePassword,
    loginTimestamps,
    logoutTimestamps,
    onResetData,
    onExportData,
    onImportData,
}) => {
    // State for admin details
    const [name, setName] = useState(adminProfile.name);
    const [email, setEmail] = useState(adminProfile.email);
    const [detailsSuccess, setDetailsSuccess] = useState('');

    // State for password change
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    const importFileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setName(adminProfile.name);
        setEmail(adminProfile.email);
    }, [adminProfile]);

    const handleDetailsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setDetailsSuccess('');
        onUpdateAdminProfile({ name, email });
        setDetailsSuccess('Admin details updated successfully!');
        setTimeout(() => setDetailsSuccess(''), 3000);
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (oldPassword !== currentPassword) {
            setPasswordError('The current password you entered is incorrect.');
            return;
        }
        if (newPassword.length < 6) {
            setPasswordError('The new password must be at least 6 characters long.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError('The new passwords do not match.');
            return;
        }

        onUpdatePassword(newPassword);
        setPasswordSuccess('Password updated successfully!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccess(''), 3000);
    };
    
    const formatTimestamp = (isoString: string) => {
        return new Date(isoString).toLocaleString('en-AU', {
            dateStyle: 'medium',
            timeStyle: 'medium',
        });
    };

    const handleImportClick = () => {
        importFileRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const fileContent = event.target?.result;
            if (typeof fileContent === 'string') {
                onImportData(fileContent);
            }
        };
        reader.readAsText(file);
        
        // Reset file input to allow selecting the same file again
        e.target.value = '';
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold text-gray-700 mb-6">Admin Profile</h2>
                <form onSubmit={handleDetailsSubmit} className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Admin Name"
                            type="text"
                            name="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                         <Input
                            label="Admin Email"
                            type="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                     {detailsSuccess && <p className="text-sm text-green-600">{detailsSuccess}</p>}
                    <div className="flex justify-end pt-2">
                        <Button type="submit" variant="primary">Update Details</Button>
                    </div>
                </form>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold text-gray-700 mb-6">Change Password</h3>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div className="space-y-4">
                        <Input
                            label="Current Password"
                            type="password"
                            name="oldPassword"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            required
                        />
                        <Input
                            label="New Password"
                            type="password"
                            name="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                        <Input
                            label="Confirm New Password"
                            type="password"
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
                    {passwordSuccess && <p className="text-sm text-green-600">{passwordSuccess}</p>}

                    <div className="flex justify-end pt-4">
                        <Button type="submit" variant="primary">Update Password</Button>
                    </div>
                </form>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold text-gray-700 mb-6">Session History</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div>
                        <h4 className="font-medium text-gray-600 mb-2">Recent Logins</h4>
                        <ul className="space-y-1 text-gray-800 list-disc list-inside">
                             {loginTimestamps.length > 0 ? loginTimestamps.map((ts, i) => (
                                <li key={`login-${i}`}>{formatTimestamp(ts)}</li>
                            )) : <p className="text-gray-500 italic">No login history.</p>}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-600 mb-2">Recent Logouts</h4>
                         <ul className="space-y-1 text-gray-800 list-disc list-inside">
                           {logoutTimestamps.length > 0 ? logoutTimestamps.map((ts, i) => (
                                <li key={`logout-${i}`}>{formatTimestamp(ts)}</li>
                            )) : <p className="text-gray-500 italic">No logout history.</p>}
                        </ul>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Data Management</h3>
                <p className="text-sm text-gray-600 mb-6">
                    Export your current application data as a JSON file for backup or to import into another browser. Importing a file will overwrite all existing data.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="file"
                        ref={importFileRef}
                        className="hidden"
                        accept=".json"
                        onChange={handleFileChange}
                    />
                    <Button onClick={handleImportClick} variant="secondary" className="w-full sm:w-auto">
                        <UploadIcon className="mr-2" />
                        Import Data
                    </Button>
                    <Button onClick={onExportData} variant="secondary" className="w-full sm:w-auto">
                        <DownloadIcon className="mr-2" />
                        Export Data
                    </Button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg border border-red-200">
                 <h3 className="text-xl font-semibold text-red-700 mb-4">Danger Zone</h3>
                 <div className="flex justify-between items-center">
                    <div>
                        <p className="font-medium text-gray-800">Reset Application Data</p>
                        <p className="text-sm text-gray-600">This will permanently delete all members, invoices, and settings, restoring the application to its original state.</p>
                    </div>
                    <Button onClick={onResetData} variant="danger">Reset Data</Button>
                 </div>
            </div>
        </div>
    );
};

export default Profile;