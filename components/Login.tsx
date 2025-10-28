import React, { useState } from 'react';
import Button from './common/Button';
import Input from './common/Input';

interface LoginProps {
    onLogin: (password: string) => boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const success = onLogin(password);
        if (!success) {
            setError('Incorrect password. Please try again.');
        } else {
            setError('');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">ECCNSW</h1>
                    <p className="text-sm text-gray-500">Membership Platform Login</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Password"
                        name="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Enter your password"
                    />
                    {error && (
                        <p className="text-sm text-red-600">{error}</p>
                    )}
                    <div>
                        <Button type="submit" variant="primary" className="w-full">
                            Login
                        </Button>
                    </div>
                     <p className="text-xs text-center text-gray-400">Hint: The default password is `admin123`</p>
                </form>
            </div>
        </div>
    );
};

export default Login;