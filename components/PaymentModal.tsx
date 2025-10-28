
import React, { useState, useEffect } from 'react';
import { Invoice } from '../types';
import Modal from './common/Modal';
import Input from './common/Input';
import Textarea from './common/Textarea';
import Button from './common/Button';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (invoice: Invoice) => void;
    invoice: Invoice;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSave, invoice }) => {
    const [paidDate, setPaidDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentDetails, setPaymentDetails] = useState('');
    const [amountPaid, setAmountPaid] = useState<number>(invoice.amount - (invoice.amountPaid || 0));

    useEffect(() => {
        if (isOpen) {
            setPaidDate(invoice.paidDate || new Date().toISOString().split('T')[0]);
            setPaymentDetails(invoice.paymentDetails || '');
            setAmountPaid(invoice.amount - (invoice.amountPaid || 0));
        }
    }, [isOpen, invoice]);

    const handleSave = () => {
        const newTotalPaid = (invoice.amountPaid || 0) + amountPaid;
        const newStatus = newTotalPaid >= invoice.amount ? 'paid' : 'partially-paid';
        
        onSave({
            ...invoice,
            status: newStatus,
            paidDate: paidDate,
            paymentDetails: `${invoice.paymentDetails || ''}\n[${paidDate}] Paid $${amountPaid}. ${paymentDetails}`.trim(),
            amountPaid: newTotalPaid,
        });
    };

    const amountDue = invoice.amount - (invoice.amountPaid || 0);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Record Payment">
            <div className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="font-semibold text-blue-800">Invoice Total: ${invoice.amount.toFixed(2)}</p>
                    <p className="text-sm text-blue-700">Amount Paid so far: ${ (invoice.amountPaid || 0).toFixed(2)}</p>
                    <p className="text-sm text-blue-700 font-bold">Amount Due: ${amountDue.toFixed(2)}</p>
                </div>
                <Input
                    label="Payment Date"
                    type="date"
                    value={paidDate}
                    onChange={(e) => setPaidDate(e.target.value)}
                />
                <Input
                    label="Amount to Pay"
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                    step="0.01"
                    max={amountDue}
                />
                <Textarea
                    label="Payment Details (method, reference, etc.)"
                    value={paymentDetails}
                    onChange={(e) => setPaymentDetails(e.target.value)}
                    rows={3}
                />
            </div>
            <div className="mt-6 flex justify-end space-x-3">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="button" variant="primary" onClick={handleSave}>Save Payment</Button>
            </div>
        </Modal>
    );
};

export default PaymentModal;
