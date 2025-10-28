import React from 'react';
import { Member, Invoice, AppSettings } from '../types';

interface InvoiceTemplateProps {
    member: Member;
    invoice: Invoice;
    settings: AppSettings;
}

const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ member, invoice, settings }) => {
    const { levelAtTimeOfInvoice } = invoice;

    const total = invoice.amount;
    const subtotal = total / 1.1;
    const tax = total - subtotal;
    
    // Check if the invoice amount is a custom one or calculated from standard fees
    const annualFee = levelAtTimeOfInvoice.annualFee;
    const joiningFee = invoice.includeJoiningFee ? levelAtTimeOfInvoice.joiningFee : 0;
    const numberOfYears = invoice.numberOfYears ?? (annualFee > 0 ? (total - joiningFee) / annualFee : 1);
    const isMultiYear = numberOfYears > 1 && Math.abs(numberOfYears - Math.round(numberOfYears)) < 0.01; // check if it's a whole number of years
    
    const calculatedStandardTotal = (isMultiYear ? (annualFee * numberOfYears) : annualFee) + joiningFee;
    const isCustomAmount = calculatedStandardTotal.toFixed(2) !== total.toFixed(2) && !isMultiYear;


    return (
        <div className="p-10 bg-white font-sans text-gray-800 max-w-[650px] w-[210mm] min-h-[297mm] relative">
            {invoice.status === 'paid' && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform rotate-[-45deg] opacity-10 pointer-events-none">
                    <p className="text-9xl font-extrabold text-green-500 border-8 border-green-500 p-8 rounded-md">PAID</p>
                </div>
            )}
            {invoice.status === 'void' && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform rotate-[-45deg] opacity-10 pointer-events-none">
                    <p className="text-9xl font-extrabold text-red-500 border-8 border-red-500 p-8 rounded-md">VOID</p>
                </div>
            )}
            <div className="flex justify-between items-start mb-10">
                <div>
                     {settings.customLogo ? (
                        <img src={settings.customLogo} alt="Logo" className="h-16 w-auto" />
                    ) : (
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">ECCNSW</h1>
                            <p className="text-sm">Ethnic Communities Council of NSW</p>
                        </div>
                    )}
                </div>
                <h2 className="text-4xl font-light text-gray-600">INVOICE</h2>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-12">
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Bill To</h3>
                    <p className="font-bold">{member.name}</p>
                    <p>{member.postalAddress}</p>
                </div>
                <div className="text-right">
                    <p><span className="font-semibold">Invoice No:</span> {invoice.id.split('-').pop()}</p>
                    <p><span className="font-semibold">Date of Invoice:</span> {new Date(invoice.date).toLocaleDateString('en-AU')}</p>
                    {invoice.dueDate && <p><span className="font-semibold">Due Date:</span> {new Date(invoice.dueDate).toLocaleDateString('en-AU')}</p>}
                    <p><span className="font-semibold">Membership Period:</span> {invoice.financialYear.label}</p>
                </div>
            </div>

            <table className="w-full mb-12">
                <thead className="border-b-2 border-gray-300">
                    <tr>
                        <th className="text-left py-2 font-semibold text-gray-600 uppercase text-sm w-3/4">Item Description</th>
                        <th className="text-right py-2 font-semibold text-gray-600 uppercase text-sm w-1/4">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {isCustomAmount ? (
                         <tr className="border-b border-gray-200">
                            <td className="py-3">
                                <p className="font-medium">{levelAtTimeOfInvoice.name}</p>
                                <p className="text-sm text-gray-500">Custom membership invoice for financial year {invoice.financialYear.label}</p>
                            </td>
                            <td className="text-right py-3 align-top">${invoice.amount.toFixed(2)}</td>
                        </tr>
                    ) : (
                        <>
                            {levelAtTimeOfInvoice.annualFee > 0 && (
                                <tr className="border-b border-gray-200">
                                    <td className="py-3">
                                        <p className="font-medium">Membership Renewal Fee</p>
                                        <p className="text-sm text-gray-500">{levelAtTimeOfInvoice.name} - for financial year {invoice.financialYear.label}{isMultiYear ? ` (x${Math.round(numberOfYears)} years)`: ''}</p>
                                    </td>
                                    <td className="text-right py-3 align-top">
                                        <p>${(levelAtTimeOfInvoice.annualFee * (isMultiYear ? Math.round(numberOfYears) : 1)).toFixed(2)}</p>
                                        <p className="text-xs text-gray-500">
                                            {isMultiYear 
                                                ? `${Math.round(numberOfYears)} years @ $${levelAtTimeOfInvoice.annualFee.toFixed(2)}/year`
                                                : `Annual Fee: $${levelAtTimeOfInvoice.annualFee.toFixed(2)}`
                                            }
                                        </p>
                                    </td>
                                </tr>
                            )}
                            {invoice.includeJoiningFee && levelAtTimeOfInvoice.joiningFee > 0 && (
                                <tr className="border-b border-gray-200">
                                    <td className="py-3">
                                        <p className="font-medium">New Member Joining Fee</p>
                                        <p className="text-sm text-gray-500">{levelAtTimeOfInvoice.name}</p>
                                    </td>
                                    <td className="text-right py-3 align-top">${levelAtTimeOfInvoice.joiningFee.toFixed(2)}</td>
                                </tr>
                            )}
                        </>
                    )}
                </tbody>
            </table>

            <div className="flex justify-end mb-12">
                <div className="w-full max-w-xs">
                    <div className="flex justify-between py-1">
                        <span className="text-gray-600">Subtotal (ex. GST)</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                        <span className="text-gray-600">GST (10%)</span>
                        <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-2 mt-2 border-t-2 border-gray-300">
                        <span className="font-bold text-lg">Total (inc. GST)</span>
                        <span className="font-bold text-lg">${total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            
            {invoice.notes && (
                 <div className="mb-10">
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Notes</h3>
                    <div className="text-sm text-gray-700 whitespace-pre-wrap p-4 bg-gray-50 rounded-md border border-gray-200">{invoice.notes}</div>
                </div>
            )}


            <div className="mt-auto pt-10 border-t border-gray-200 text-xs text-gray-600">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Payment Instructions</h3>
                <div className="whitespace-pre-wrap">{settings.paymentInstructions}</div>
            </div>
        </div>
    );
};

export default InvoiceTemplate;