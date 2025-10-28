import React, { useState, useEffect, useMemo } from 'react';
import { Member, MemberStatus, Invoice, FinancialYear, MembershipLevel, MembershipGroup, AppSettings } from '../types';
import Modal from './common/Modal';
import Input from './common/Input';
import Select from './common/Select';
import Button from './common/Button';
import Textarea from './common/Textarea';
import InvoiceTemplate from './InvoiceTemplate';
import { jsPDF } from 'jspdf';
import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';

const GenerateSingleInvoiceModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    member: Member & { status: MemberStatus };
    onSave: (invoice: Invoice) => void;
    financialYears: FinancialYear[];
    existingInvoices: Invoice[];
    membershipLevels: MembershipGroup[];
    settings: AppSettings;
}> = ({ 
    isOpen, 
    onClose, 
    member, 
    onSave,
    financialYears,
    membershipLevels,
    settings,
}) => {
    
    const allLevels = useMemo(() => membershipLevels.flatMap(g => g.levels), [membershipLevels]);

    const [financialYear, setFinancialYear] = useState<FinancialYear>(financialYears[0]);
    const [level, setLevel] = useState<MembershipLevel>(allLevels.find(l => l.id === member.membershipLevelId)!);
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [numberOfYears, setNumberOfYears] = useState(1);
    
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 30);
    const [dueDate, setDueDate] = useState(defaultDueDate.toISOString().split('T')[0]);

    const [amount, setAmount] = useState(0);
    const [waiveFee, setWaiveFee] = useState(false);
    const [includeJoiningFee, setIncludeJoiningFee] = useState(false);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        const selectedLevel = allLevels.find(l => l.id === member.membershipLevelId) || allLevels[0];
        setLevel(selectedLevel);
        const currentFY = financialYears.find(fy => new Date() >= new Date(fy.start) && new Date() <= new Date(fy.end)) || financialYears[0];
        setFinancialYear(currentFY);
    }, [member, financialYears, allLevels]);

    useEffect(() => {
        if (waiveFee) {
            setAmount(0);
        } else {
            const annualTotal = level.annualFee * numberOfYears;
            const joiningTotal = includeJoiningFee ? level.joiningFee : 0;
            setAmount(annualTotal + joiningTotal);
        }
    }, [level, waiveFee, includeJoiningFee, numberOfYears]);
    
     const temporaryInvoice = useMemo((): Invoice => {
        let finalNotes = notes;
        if (numberOfYears > 1) {
            const startYearLabel = financialYear.label;
            const startYearNumber = parseInt(startYearLabel.split('-')[0]);
            const endYearNumber = startYearNumber + numberOfYears - 1;
            const endYearLabel = `${endYearNumber}-${endYearNumber + 1}`;
            const multiYearNote = `This invoice covers membership for ${numberOfYears} financial years, from ${startYearLabel} to ${endYearLabel}.`;
            finalNotes = `${multiYearNote}\n\n${notes}`.trim();
        }
        return {
            id: `inv-${member.id}-${financialYear.label.replace('-', '')}-${Date.now()}`,
            memberId: member.id,
            financialYear: financialYear,
            levelAtTimeOfInvoice: level,
            date: invoiceDate,
            dueDate: dueDate,
            amount: amount,
            status: amount > 0 ? 'unpaid' : 'paid',
            includeJoiningFee: includeJoiningFee,
            numberOfYears: numberOfYears,
            notes: finalNotes,
        };
    }, [member, financialYear, level, invoiceDate, dueDate, amount, includeJoiningFee, numberOfYears, notes]);


    const handleSave = () => {
        const newInvoice: Invoice = {
            ...temporaryInvoice,
            paidDate: amount === 0 ? invoiceDate : undefined,
            paymentDetails: amount === 0 ? 'Membership fee waived.' : undefined,
            amountPaid: amount === 0 ? 0 : 0,
        };
        onSave(newInvoice);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`New Invoice for ${member.name}`}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="space-y-4 lg:col-span-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select label="Starting Financial Year" value={financialYear.label} onChange={e => setFinancialYear(financialYears.find(fy => fy.label === e.target.value)!)}>
                            {financialYears.map(fy => <option key={fy.label} value={fy.label}>{fy.label}</option>)}
                        </Select>
                        <Input label="Invoice Date" type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select label="Membership Level for Invoice" value={level.id} onChange={e => setLevel(allLevels.find(l => l.id === e.target.value)!)}>
                            {membershipLevels.map(group => (
                                <optgroup label={group.groupName} key={group.groupName}>
                                    {group.levels.map(level => <option key={level.id} value={level.id}>{level.name}</option>)}
                                </optgroup>
                            ))}
                        </Select>
                        <Input label="Due Date" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Number of Years" type="number" value={numberOfYears} min="1" step="1" onChange={e => setNumberOfYears(parseInt(e.target.value, 10) || 1)} />
                    </div>
                    <div>
                        <div className="flex items-center justify-between">
                             <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount (inc. GST)</label>
                            <div className="flex items-center space-x-4">
                                <label className="flex items-center text-sm text-gray-600 cursor-pointer">
                                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 bg-white text-[#004a97] shadow-sm focus:border-[#004a97] focus:ring focus:ring-offset-0 focus:ring-[#004a97]/50" checked={includeJoiningFee} onChange={e => setIncludeJoiningFee(e.target.checked)} disabled={waiveFee} />
                                    <span className="ml-2">Include Joining Fee</span>
                                </label>
                                <label className="flex items-center text-sm text-gray-600 cursor-pointer">
                                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 bg-white text-[#004a97] shadow-sm focus:border-[#004a97] focus:ring focus:ring-offset-0 focus:ring-[#004a97]/50" checked={waiveFee} onChange={e => setWaiveFee(e.target.checked)} />
                                    <span className="ml-2">Waive Fee</span>
                                </label>
                            </div>
                        </div>
                         <Input label="" type="number" value={amount.toFixed(2)} onChange={e => setAmount(parseFloat(e.target.value))} step="0.01" disabled={waiveFee} />
                         <p className="text-xs text-gray-500 mt-1">
                            Calculated based on {level.name} level. Annual: ${level.annualFee}, Joining: ${level.joiningFee}.
                         </p>
                    </div>
                    <Textarea label="Notes (optional, will appear on invoice)" value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
                </div>

                 <div className="bg-gray-100 p-4 rounded-md border h-[70vh] overflow-auto lg:col-span-2">
                    <h4 className="text-center font-semibold text-gray-700 mb-2 sticky top-0 bg-gray-100 py-2 z-10">Invoice Preview</h4>
                    <div className="p-2">
                        <div className="shadow-lg mx-auto max-w-[650px]">
                            <InvoiceTemplate member={member} invoice={temporaryInvoice} settings={settings} />
                        </div>
                    </div>
                </div>
            </div>

             <div className="mt-6 flex justify-end space-x-3">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="button" variant="primary" onClick={handleSave}>Save Invoice</Button>
            </div>
        </Modal>
    );
};

export default GenerateSingleInvoiceModal;