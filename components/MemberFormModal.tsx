import React, { useState, useEffect, useMemo } from 'react';
import { Member, MembershipLevel, Invoice, FinancialYear, Delegate, MembershipGroup } from '../types';
import Modal from './common/Modal';
import Input from './common/Input';
import Select from './common/Select';
import Button from './common/Button';

interface MemberFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (member: Member) => void;
    member?: Member;
    financialYear: FinancialYear;
    membershipLevels: MembershipGroup[];
}

const getInitialFormData = (financialYear: FinancialYear, allLevels: MembershipLevel[], member?: Member): Omit<Member, 'id' | 'status'> => {
    if (member) {
        return {
            name: member.name,
            membershipLevelId: member.membershipLevelId,
            startDate: member.startDate,
            endDate: member.endDate,
            contactName: member.contactName,
            telephone: member.telephone,
            postalAddress: member.postalAddress,
            isGloballyArchived: member.isGloballyArchived,
            delegates: member.delegates,
            cancelledFinancialYears: member.cancelledFinancialYears || [],
        };
    }
    return {
        name: '',
        membershipLevelId: allLevels.length > 0 ? allLevels[0].id : '',
        startDate: financialYear.start,
        endDate: financialYear.end,
        contactName: '',
        telephone: '',
        postalAddress: '',
        isGloballyArchived: false,
        delegates: [],
        cancelledFinancialYears: [],
    };
};


const MemberFormModal: React.FC<MemberFormModalProps> = ({ isOpen, onClose, onSave, member, financialYear, membershipLevels }) => {
    
    const allLevels = useMemo(() => membershipLevels.flatMap(g => g.levels), [membershipLevels]);
    
    const [formData, setFormData] = useState<Omit<Member, 'id' | 'status'>>(() => getInitialFormData(financialYear, allLevels, member));
    
    const [selectedLevel, setSelectedLevel] = useState<MembershipLevel | undefined>(
        allLevels.find(l => l.id === formData.membershipLevelId)
    );

    useEffect(() => {
        // This effect now correctly resets the form ONLY when the member prop changes (i.e., when opening the modal for a different member or a new one)
        setFormData(getInitialFormData(financialYear, allLevels, member));
    }, [member, financialYear, allLevels]);
    
    useEffect(() => {
        const level = allLevels.find(l => l.id === formData.membershipLevelId);
        setSelectedLevel(level);

        setFormData(prev => {
            const newDelegates: Delegate[] = [];
            if (level) {
                const existingNormalDelegates = prev.delegates.filter(d => d.type === 'delegate');
                const existingYouthDelegates = prev.delegates.filter(d => d.type === 'youth_delegate');

                for (let i = 0; i < level.delegateOptions.delegates; i++) {
                    newDelegates.push({ name: existingNormalDelegates[i]?.name || '', type: 'delegate' });
                }
                for (let i = 0; i < level.delegateOptions.youthDelegates; i++) {
                    newDelegates.push({ name: existingYouthDelegates[i]?.name || '', type: 'youth_delegate' });
                }
            }
            return { ...prev, delegates: newDelegates };
        });
    }, [formData.membershipLevelId, allLevels]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleDelegateChange = (index: number, value: string) => {
        const newDelegates = [...formData.delegates];
        newDelegates[index].name = value;
        setFormData(prev => ({...prev, delegates: newDelegates}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, id: member?.id || '' });
    };

    const title = member ? 'Edit Member' : 'Add New Member';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Member Name" name="name" value={formData.name} onChange={handleChange} required />
                    <Select label="Membership Level" name="membershipLevelId" value={formData.membershipLevelId} onChange={handleChange}>
                        {membershipLevels.map(group => (
                            <optgroup label={group.groupName} key={group.groupName}>
                                {group.levels.map(level => <option key={level.id} value={level.id}>{level.name}</option>)}
                            </optgroup>
                        ))}
                    </Select>
                    <Input label="Membership Start Date" name="startDate" type="date" value={formData.startDate} onChange={handleChange} required />
                    <Input label="Membership End Date" name="endDate" type="date" value={formData.endDate} onChange={handleChange} required />
                    <Input label="Contact Name" name="contactName" value={formData.contactName} onChange={handleChange} required />
                    <Input label="Telephone" name="telephone" value={formData.telephone} onChange={handleChange} required />
                    <div className="md:col-span-2">
                        <Input label="Postal Address" name="postalAddress" value={formData.postalAddress} onChange={handleChange} required />
                    </div>

                    {selectedLevel && (selectedLevel.delegateOptions.delegates > 0 || selectedLevel.delegateOptions.youthDelegates > 0) && (
                        <div className="md:col-span-2 mt-4 p-4 border rounded-md">
                            <h3 className="font-medium text-gray-700 mb-2">Delegates</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {(() => {
                                let delegateCount = 0;
                                let youthDelegateCount = 0;
                                return formData.delegates.map((delegate, index) => {
                                    const label = delegate.type === 'delegate'
                                        ? `Delegate ${++delegateCount}`
                                        : `Youth Delegate ${++youthDelegateCount}`;
                                    return (
                                        <Input 
                                            key={index}
                                            label={label}
                                            value={delegate.name}
                                            onChange={(e) => handleDelegateChange(index, e.target.value)}
                                        />
                                    );
                                });
                            })()}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="primary">Save Member</Button>
                </div>
            </form>
        </Modal>
    );
};

export default MemberFormModal;