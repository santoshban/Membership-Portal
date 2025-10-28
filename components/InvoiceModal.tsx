import React, { useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { createRoot } from 'react-dom/client';
import { Member, Invoice, MemberStatus, FinancialYear, MembershipGroup, AppSettings } from '../types';
import Modal from './common/Modal';
import Select from './common/Select';
import Button from './common/Button';
import Input from './common/Input';
import InvoiceTemplate from './InvoiceTemplate';

interface InvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    members: (Member & { status: MemberStatus })[];
    onGenerate: (invoices: Invoice[]) => void;
    financialYear: FinancialYear; // This is the currently VIEWED FY from App state
    existingInvoices: Invoice[];
    financialYears: FinancialYear[];
    membershipLevels: MembershipGroup[];
    settings: AppSettings;
}

type GenerationType = 'all' | 'unpaid' | 'level';

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


const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, members, onGenerate, financialYear, existingInvoices, financialYears, membershipLevels, settings }) => {
    const [generationType, setGenerationType] = useState<GenerationType>('unpaid');
    const [selectedLevel, setSelectedLevel] = useState<string>('all');
    const [selectedGenFY, setSelectedGenFY] = useState<FinancialYear>(financialYear);
    const [includeJoiningFeeForNew, setIncludeJoiningFeeForNew] = useState(true);
    
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 30);
    const [dueDate, setDueDate] = useState(defaultDueDate.toISOString().split('T')[0]);

    const [isLoading, setIsLoading] = useState(false);
    
    const allLevels = useMemo(() => membershipLevels.flatMap(g => g.levels), [membershipLevels]);

    const membersToInvoice = useMemo(() => {
        let filtered = members.filter(m => !m.isGloballyArchived);
        const isCurrentFY = selectedGenFY.label === financialYear.label;

        switch (generationType) {
            case 'unpaid':
                if (isCurrentFY) {
                    filtered = filtered.filter(m => m.status === MemberStatus.Unpaid);
                } else {
                    return [];
                }
                break;
            case 'level':
                if (selectedLevel === 'all') return [];
                filtered = filtered.filter(m => m.membershipLevelId === selectedLevel);
                break;
            case 'all':
            default:
                break;
        }

        // Filter out members who already have a non-voided invoice for the selected generation FY
        return filtered.filter(m => 
            !existingInvoices.some(inv => 
                inv.memberId === m.id && 
                inv.financialYear.label === selectedGenFY.label &&
                inv.status !== 'void'
            )
        );

    }, [members, generationType, selectedLevel, financialYear, existingInvoices, selectedGenFY]);

    const handleGenerate = async () => {
        setIsLoading(true);
        const newInvoices: Invoice[] = [];
        
        if (membersToInvoice.length > 0) {
            const zip = new JSZip();
            for (const member of membersToInvoice) {
                const level = allLevels.find(l => l.id === member.membershipLevelId);
                if (!level) continue;

                const isFirstYear = new Date(member.startDate).getFullYear().toString() === selectedGenFY.label.split('-')[0];
                const shouldIncludeJoiningFee = isFirstYear && includeJoiningFeeForNew;
                const total = level.annualFee + (shouldIncludeJoiningFee ? level.joiningFee : 0);

                const newInvoice: Invoice = {
                    id: `inv-${member.id}-${selectedGenFY.label.replace('-', '')}`,
                    memberId: member.id,
                    financialYear: selectedGenFY,
                    levelAtTimeOfInvoice: level,
                    date: new Date().toISOString().split('T')[0],
                    dueDate: dueDate,
                    amount: total,
                    status: total > 0 ? 'unpaid' : 'paid',
                    paidDate: total === 0 ? new Date().toISOString().split('T')[0] : undefined,
                    paymentDetails: total === 0 ? 'Complimentary membership.' : undefined,
                    amountPaid: total === 0 ? total : 0,
                    includeJoiningFee: shouldIncludeJoiningFee,
                };
                newInvoices.push(newInvoice);
                
                const pdf = await generatePdfFromComponent(<InvoiceTemplate member={member} invoice={newInvoice} settings={settings} />);
                const pdfBlob = pdf.output('blob');
                zip.file(`Invoice-${member.name.replace(/\s/g, '_')}-${selectedGenFY.label}.pdf`, pdfBlob);
            }

            const content = await zip.generateAsync({ type: 'blob' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = `Invoices-${selectedGenFY.label}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        
        onGenerate(newInvoices);
    };


    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Generate Invoices`}>
             <div className="space-y-4">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select label="Financial Year to Generate For" value={selectedGenFY.label} onChange={e => setSelectedGenFY(financialYears.find(fy => fy.label === e.target.value)!)}>
                        {financialYears.map(fy => <option key={fy.label} value={fy.label}>{fy.label}</option>)}
                    </Select>
                    <Select label="Invoice Generation Type" value={generationType} onChange={e => setGenerationType(e.target.value as GenerationType)}>
                        <option value="unpaid">Generate for Unpaid Members (Current FY)</option>
                        <option value="all">Generate for All Members</option>
                        <option value="level">Generate by Membership Level</option>
                    </Select>
                 </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input 
                        label="Due Date for Invoices"
                        type="date"
                        value={dueDate}
                        onChange={e => setDueDate(e.target.value)}
                    />
                     <div className="pt-8">
                        <label className="flex items-center text-sm text-gray-600 cursor-pointer">
                            <input type="checkbox" className="h-4 w-4 rounded border-gray-300 bg-white text-[#004a97] shadow-sm focus:border-[#004a97] focus:ring focus:ring-offset-0 focus:ring-[#004a97]/50" checked={includeJoiningFeeForNew} onChange={e => setIncludeJoiningFeeForNew(e.target.checked)} />
                            <span className="ml-2">Include joining fee for new members</span>
                        </label>
                    </div>
                </div>

                {generationType === 'level' && (
                     <Select label="Select Membership Level" value={selectedLevel} onChange={e => setSelectedLevel(e.target.value)}>
                        <option value="all">-- Select a Level --</option>
                        {membershipLevels.map(group => (
                            <optgroup label={group.groupName} key={group.groupName}>
                                {group.levels.map(level => <option key={level.id} value={level.id}>{level.name}</option>)}
                            </optgroup>
                        ))}
                    </Select>
                )}

                <div className="p-3 bg-gray-100 rounded-md">
                    <p className="text-sm text-gray-700">
                        This will generate new invoices for <strong>{membersToInvoice.length} member(s)</strong> for the <strong>{selectedGenFY.label}</strong> financial year.
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        Note: Invoices will not be generated for members who already have an invoice for the selected financial year or are globally archived. The 'unpaid' option is only applicable when generating for the currently viewed financial year.
                    </p>
                </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
                <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>Cancel</Button>
                <Button type="button" variant="primary" onClick={handleGenerate} disabled={isLoading || membersToInvoice.length === 0}>
                    {isLoading ? 'Generating...' : `Generate & Download ZIP (${membersToInvoice.length})`}
                </Button>
            </div>
        </Modal>
    );
};

export default InvoiceModal;