import React from 'react';
import Modal from './Modal';
import Button from './Button';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    confirmVariant?: 'primary' | 'danger';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', confirmVariant = 'primary' }) => {
    if (!isOpen) return null;

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex justify-center items-center p-4" onClick={onClose}>
            <div
                className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
                </div>
                <div className="p-6">
                    <p className="text-gray-600">{message}</p>
                    <div className="mt-6 flex justify-end space-x-3">
                        <Button onClick={onClose} variant="secondary">
                            Cancel
                        </Button>
                        <Button onClick={onConfirm} variant={confirmVariant}>
                            {confirmText}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;