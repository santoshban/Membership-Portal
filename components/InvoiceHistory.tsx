import React from 'react';
import { jsPDF } from 'jspdf';
import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';
import { Invoice, Member, MemberStatus, AppSettings } from '../types';
import Button from './common/Button';
import { DollarSignIcon, TrashIcon, EditIcon, DocumentTextIcon } from './icons';
import InvoiceTemplate from './InvoiceTemplate';

interface InvoiceHistoryProps {
    invoices: Invoice[];
    member: Member & { status: MemberStatus };
    onVoidInvoice: (invoiceId: string) => void;
    onMarkAsPaid: (invoiceId: string) => void;
    onEditPayment: (invoice: Invoice) => void;
    settings: AppSettings;
}

const generatePdfFromComponent = async (component: React.ReactElement): Promise<jsPDF> => {
    const invoiceElement = document.createElement('div');
    invoiceElement.style.position = 'absolute';
    invoiceElement.style.left = '-9999px';
    invoiceElement.style.width = '210mm'; 
    document.body.appendChild(invoiceElement);

    const root = createRoot(invoiceElement);
    root.render(component);

    await new Promise(resolve => setTimeout(resolve, 300)); 

    const canvas = await html2canvas(invoiceElement.firstElementChild as HTMLElement, { scale: 2 });
    
    root.unmount();
    document.body.removeChild(invoiceElement);

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
    return pdf;
};


const InvoiceHistory: React.FC<InvoiceHistoryProps> = ({ invoices, member, onVoidInvoice, onMarkAsPaid, onEditPayment, settings }) => {

    const handleDownloadPdf = async (invoice: Invoice) => {
        const pdf = await generatePdfFromComponent(<InvoiceTemplate member={member} invoice={invoice} settings={settings} />);
        pdf.save(`Invoice-${member.name.replace(/\s/g, '_')}-${invoice.financialYear.label}.pdf`);
    };
    
    const getStatusBadge = (status: Invoice['status']) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-800';
            case 'unpaid': return 'bg-red-100 text-red-800';
            case 'partially-paid': return 'bg-yellow-100 text-yellow-800';
            case 'void': return 'bg-gray-100 text-gray-600';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const renderFinancialYearLabel = (invoice: Invoice): string => {
        if (!invoice.financialYear) {
            return 'N/A';
        }
        const years = invoice.numberOfYears || 1;
        if (years <= 1) {
            return invoice.financialYear.label;
        }
        const startYear = parseInt(invoice.financialYear.label.split('-')[0], 10);
        const endFYStartYear = startYear + years - 1;
        const endFYEndYear = endFYStartYear + 1;
        return `${invoice.financialYear.label} to ${endFYStartYear}-${endFYEndYear}`;
    };

    return (
        <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FY</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 text-sm">
                    {invoices.length > 0 ? invoices.map(invoice => (
                        <tr key={invoice.id} className={`${invoice.status === 'void' ? 'opacity-50' : ''}`}>
                            <td className="px-4 py-3 whitespace-nowrap text-gray-800">{renderFinancialYearLabel(invoice)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-gray-800">{invoice.date ? new Date(invoice.date).toLocaleDateString('en-AU') : 'N/A'}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(invoice.status)}`}>
                                    {invoice.status.replace('-', ' ')}
                                </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right font-mono text-gray-800">${(invoice.amount ?? 0).toFixed(2)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-right">
                                <div className="flex justify-end items-center space-x-1">
                                    {(invoice.status === 'unpaid' || invoice.status === 'partially-paid') && (
                                        <Button size="sm" variant="icon" onClick={() => onMarkAsPaid(invoice.id)} title="Mark as fully paid">
                                            <DollarSignIcon />
                                        </Button>
                                    )}
                                    <Button size="sm" variant="icon" onClick={() => onEditPayment(invoice)} title="Edit Payment Details" disabled={invoice.status === 'void'}>
                                        <EditIcon />
                                    </Button>
                                    <Button size="sm" variant="icon" onClick={() => handleDownloadPdf(invoice)} title="Download PDF">
                                        <DocumentTextIcon className="w-4 h-4" />
                                    </Button>
                                    {invoice.status !== 'paid' && invoice.status !== 'void' && (
                                         <Button size="sm" variant="icon" onClick={() => onVoidInvoice(invoice.id)} title="Void Invoice">
                                            <TrashIcon />
                                        </Button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={5} className="text-center py-6 text-gray-500">No invoices found for this member.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default InvoiceHistory;