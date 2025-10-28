import React, { useState, useMemo } from 'react';
import { Member, MembershipLevel, Invoice, MemberStatus, FinancialYear, MembershipGroup } from '../types';
import Button from './common/Button';
import Select from './common/Select';
import Input from './common/Input';
import { EditIcon, ArchiveIcon, DollarSignIcon, FilterIcon, EyeIcon, PlusCircleIcon, DocumentTextIcon, RestoreIcon } from './icons';

interface MemberListProps {
    members: (Member & { status: MemberStatus; hasInvoice: boolean })[];
    membershipLevels: MembershipGroup[];
    onEditMember: (member: Member) => void;
    onViewMember: (member: Member & { status: MemberStatus }) => void;
    onConfirmCancellation: (member: Member, financialYear: FinancialYear) => void;
    onUpdatePaymentStatus: (memberId: string) => void;
    onAddMember: () => void;
    onGenerateInvoices: () => void;
    financialYears: FinancialYear[];
    selectedFinancialYear: FinancialYear;
    setSelectedFinancialYear: (year: FinancialYear) => void;
}

const MemberList: React.FC<MemberListProps> = ({ 
    members, 
    membershipLevels,
    onEditMember, 
    onViewMember, 
    onConfirmCancellation, 
    onUpdatePaymentStatus, 
    onAddMember,
    onGenerateInvoices,
    financialYears, 
    selectedFinancialYear, 
    setSelectedFinancialYear 
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterLevel, setFilterLevel] = useState('all');
    const [filterStatus, setFilterStatus] = useState<MemberStatus | 'all'>('all');
    const [showCancelled, setShowCancelled] = useState(false);

    const filteredMembers = useMemo(() => {
        return members.filter(member => {
            const isCancelledInYear = member.cancelledFinancialYears?.includes(selectedFinancialYear.label);
            
            if (showCancelled) {
                if (!isCancelledInYear) return false;
            } else {
                if (isCancelledInYear || member.isGloballyArchived) return false;
            }
            
            if (searchQuery && !member.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            if (filterLevel !== 'all' && member.membershipLevelId !== filterLevel) return false;
            if (filterStatus !== 'all' && member.status !== filterStatus && !showCancelled) return false;
            
            const memberStartDate = new Date(member.startDate);
            const memberEndDate = new Date(member.endDate);
            const fyStartDate = new Date(selectedFinancialYear.start);
            const fyEndDate = new Date(selectedFinancialYear.end);

            const isTermActive = memberStartDate <= fyEndDate && memberEndDate >= fyStartDate;

            return isTermActive || member.hasInvoice;
        });
    }, [members, filterLevel, filterStatus, showCancelled, selectedFinancialYear, searchQuery]);

    const getLevelGroupInfo = (levelId: string): { name: string; groupAcronym: string; groupColor: string } => {
        for (const group of membershipLevels) {
            const level = group.levels.find(l => l.id === levelId);
            if (level) {
                let groupAcronym = '';
                let groupColor = 'bg-gray-200 text-gray-800';
                if (group.groupName.includes("Associate")) {
                    groupAcronym = 'ASSO';
                    groupColor = 'bg-blue-100 text-blue-800';
                } else if (group.groupName.includes("Affiliate")) {
                    groupAcronym = 'AFFI';
                    groupColor = 'bg-purple-100 text-purple-800';
                } else if (group.groupName.includes("Corporate")) {
                    groupAcronym = 'CORP';
                    groupColor = 'bg-teal-100 text-teal-800';
                }
                return { name: level.name, groupAcronym, groupColor };
            }
        }
        return { name: 'Unknown Level', groupAcronym: 'UNK', groupColor: 'bg-gray-200 text-gray-800' };
    };
    
    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const year = financialYears.find(fy => fy.label === e.target.value);
        if (year) setSelectedFinancialYear(year);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                 <h2 className="text-xl font-semibold text-gray-700">Members</h2>
                 <div className="flex items-center space-x-2 sm:space-x-4">
                    <Button onClick={onAddMember} variant="primary">
                        <PlusCircleIcon className="w-5 h-5 mr-2" />
                        <span className="hidden sm:inline">Add Member</span>
                    </Button>
                    <Button onClick={onGenerateInvoices} variant="secondary">
                        <DocumentTextIcon className="w-5 h-5 mr-2" />
                        <span className="hidden sm:inline">Generate Invoices</span>
                    </Button>
                </div>
            </div>
            <div className="mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-end">
                    <Select label="Financial Year" value={selectedFinancialYear.label} onChange={handleYearChange}>
                        {financialYears.map(fy => <option key={fy.label} value={fy.label}>{fy.label}</option>)}
                    </Select>
                    <Input
                        label="Search by Name"
                        name="search"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Filter by name..."
                    />
                    <Select label="Filter by Level" value={filterLevel} onChange={e => setFilterLevel(e.target.value)}>
                        <option value="all">All Levels</option>
                        {membershipLevels.map(group => (
                            <optgroup label={group.groupName} key={group.groupName}>
                                {group.levels.map(level => <option key={level.id} value={level.id}>{level.name}</option>)}
                            </optgroup>
                        ))}
                    </Select>
                    <Select label="Filter by Status" value={filterStatus} onChange={e => setFilterStatus(e.target.value as MemberStatus | 'all')} disabled={showCancelled}>
                        <option value="all">All Statuses</option>
                        {Object.values(MemberStatus).map(status => <option key={status} value={status}>{status}</option>)}
                    </Select>
                    <div className="pt-8">
                        <label className="flex items-center text-sm text-gray-600 cursor-pointer">
                            <input type="checkbox" className="h-4 w-4 rounded border-gray-300 bg-white text-[#004a97] shadow-sm focus:border-[#004a97] focus:ring focus:ring-offset-0 focus:ring-[#004a97]/50" checked={showCancelled} onChange={e => setShowCancelled(e.target.checked)} />
                            <span className="ml-2">{showCancelled ? 'Showing Cancelled' : 'Show Cancelled'}</span>
                        </label>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membership Level</th>
                            {showCancelled ? (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            ) : (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status ({selectedFinancialYear.label})</th>
                            )}
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredMembers.length > 0 ? filteredMembers.map(member => {
                            const levelInfo = getLevelGroupInfo(member.membershipLevelId);
                             const isCancelledInYear = member.cancelledFinancialYears?.includes(selectedFinancialYear.label);
                            return (
                                <tr key={member.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{member.name}</div>
                                        <div className="text-sm text-gray-500">{member.contactName}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        <div className="flex items-center">
                                             <span className={`px-2 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full ${levelInfo.groupColor} mr-3`}>
                                                {levelInfo.groupAcronym}
                                            </span>
                                            <span>{levelInfo.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            isCancelledInYear ? 'bg-gray-200 text-gray-800' :
                                            member.status === MemberStatus.Paid ? 'bg-green-100 text-green-800' :
                                            member.status === MemberStatus.Unpaid ? 'bg-red-100 text-red-800' :
                                            member.status === MemberStatus.PartiallyPaid ? 'bg-yellow-100 text-yellow-800' :
                                            member.status === MemberStatus.Pending ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {isCancelledInYear ? `Cancelled for ${selectedFinancialYear.label}` : member.status}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end items-center space-x-2">
                                            {!showCancelled && (
                                                <Button size="sm" variant="icon" onClick={() => onUpdatePaymentStatus(member.id)} title="Update Payment" disabled={member.status === MemberStatus.Paid || !member.hasInvoice}>
                                                    <DollarSignIcon />
                                                </Button>
                                            )}
                                            <Button size="sm" variant="icon" onClick={() => onViewMember(member)} title="View Details">
                                                <EyeIcon />
                                            </Button>
                                            <Button size="sm" variant="icon" onClick={() => onEditMember(member)} title="Edit Member">
                                                <EditIcon />
                                            </Button>
                                            <Button size="sm" variant="icon" onClick={() => onConfirmCancellation(member, selectedFinancialYear)} title={isCancelledInYear ? 'Restore for this FY' : 'Cancel for this FY'}>
                                                 {isCancelledInYear ? <RestoreIcon /> : <ArchiveIcon />}
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        }) : (
                            <tr>
                                <td colSpan={4} className="text-center py-10 text-gray-500">No members found for the selected filters.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MemberList;