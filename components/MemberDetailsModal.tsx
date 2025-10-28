import React from 'react';
import { Member, MemberStatus, Invoice, AppSettings } from '../types';
import Modal from './common/Modal';
import Button from './common/Button';
import InvoiceHistory from './InvoiceHistory';
import { DocumentTextIcon } from './icons';

interface MemberDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    member: Member & { status: MemberStatus };
    invoices: Invoice[];
    onVoidInvoice: (invoiceId: string) => void;
    onMarkAsPaid: (invoiceId: string) => void;
    onEditPayment: (invoice: Invoice) => void;
    onGenerateNewInvoice: () => void;
    settings: AppSettings;
}

const MemberDetailsModal: React.FC<MemberDetailsModalProps> = ({ 
    isOpen, 
    onClose, 
    member, 
    invoices, 
    onVoidInvoice, 
    onMarkAsPaid, 
    onEditPayment,
    onGenerateNewInvoice,
    settings,
}) => {
    
    const sortedInvoices = [...invoices].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Member Details: ${member.name}`}>
            <div className="space-y-6">
                {/* Member Info Section */}
                <div className="p-4 border rounded-lg bg-gray-50">
                    <h3 className="font-semibold text-lg text-gray-800 mb-3">Member Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-500">Contact Name</p>
                            <p className="text-gray-900 font-medium">{member.contactName}</p>
                        </div>
                         <div>
                            <p className="text-gray-500">Telephone</p>
                            <p className="text-gray-900 font-medium">{member.telephone}</p>
                        </div>
                        <div className="sm:col-span-2">
                            <p className="text-gray-500">Postal Address</p>
                            <p className="text-gray-900 font-medium">{member.postalAddress}</p>
                        </div>
                         <div>
                            <p className="text-gray-500">Membership Dates</p>
                            <p className="text-gray-900 font-medium">{member.startDate} to {member.endDate}</p>
                        </div>
                    </div>
                </div>

                {/* Delegates Section */}
                {member.delegates.length > 0 && (
                     <div className="p-4 border rounded-lg bg-gray-50">
                        <h3 className="font-semibold text-lg text-gray-800 mb-3">Delegates</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            {member.delegates.map((delegate, index) => (
                                <div key={index}>
                                    <p className="text-gray-500 capitalize">{delegate.type.replace('_', ' ')}</p>
                                    <p className="text-gray-900 font-medium">{delegate.name || <span className="italic text-gray-400">Not assigned</span>}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Invoice History Section */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-lg text-gray-800">Invoice History</h3>
                        <Button onClick={onGenerateNewInvoice} variant="primary" size="sm">
                            <DocumentTextIcon className="w-4 h-4 mr-2" />
                            Generate New Invoice
                        </Button>
                    </div>
                    <InvoiceHistory 
                        invoices={sortedInvoices}
                        onVoidInvoice={onVoidInvoice}
                        onMarkAsPaid={onMarkAsPaid}
                        onEditPayment={onEditPayment}
                        member={member}
                        settings={settings}
                    />
                </div>
            </div>
            <div className="mt-6 flex justify-end">
                <Button type="button" variant="secondary" onClick={onClose}>Close</Button>
            </div>
        </Modal>
    );
};

export default MemberDetailsModal;