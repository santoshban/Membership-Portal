import React, { useState, useEffect } from 'react';
import { MembershipLevel, MembershipGroup } from '../types';
import Modal from './common/Modal';
import Input from './common/Input';
import Select from './common/Select';
import Button from './common/Button';

interface LevelFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (level: MembershipLevel, groupName: string) => void;
    level?: MembershipLevel;
    groupName?: string;
    membershipLevels: MembershipGroup[];
}

const LevelFormModal: React.FC<LevelFormModalProps> = ({ isOpen, onClose, onSave, level, groupName, membershipLevels }) => {
    
    const [formData, setFormData] = useState({
        id: level?.id || '',
        name: level?.name || '',
        groupName: groupName || '',
        newGroupName: '',
        joiningFee: level?.joiningFee || 0,
        annualFee: level?.annualFee || 0,
        delegates: level?.delegateOptions.delegates || 0,
        youthDelegates: level?.delegateOptions.youthDelegates || 0,
    });
    
    useEffect(() => {
        if(level) {
             setFormData({
                id: level.id,
                name: level.name,
                groupName: groupName || '',
                newGroupName: '',
                joiningFee: level.joiningFee,
                annualFee: level.annualFee,
                delegates: level.delegateOptions.delegates,
                youthDelegates: level.delegateOptions.youthDelegates,
            });
        } else {
             setFormData({
                id: '',
                name: '',
                groupName: '',
                newGroupName: '',
                joiningFee: 0,
                annualFee: 0,
                delegates: 0,
                youthDelegates: 0,
            });
        }
    }, [level, groupName, isOpen]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const isNumeric = ['joiningFee', 'annualFee', 'delegates', 'youthDelegates'].includes(name);
        setFormData(prev => ({ ...prev, [name]: isNumeric ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalGroupName = formData.groupName === 'new' ? formData.newGroupName : formData.groupName;

        const newLevel: MembershipLevel = {
            id: formData.id || `${formData.name.toLowerCase().replace(/\s/g, '-')}-${Date.now()}`,
            name: formData.name,
            joiningFee: formData.joiningFee,
            annualFee: formData.annualFee,
            delegateOptions: {
                delegates: formData.delegates,
                youthDelegates: formData.youthDelegates,
            },
        };
        onSave(newLevel, finalGroupName);
    };

    const title = level ? 'Edit Membership Level' : 'Add New Membership Level';
    const existingGroupNames = membershipLevels.map(g => g.groupName);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Level Name" name="name" value={formData.name} onChange={handleChange} required />
                    <div>
                        <Select label="Group Name" name="groupName" value={formData.groupName} onChange={handleChange} required>
                            <option value="" disabled>Select a group</option>
                            {existingGroupNames.map(name => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                            <option value="new">-- Create a New Group --</option>
                        </Select>
                        {formData.groupName === 'new' && (
                            <Input label="New Group Name" name="newGroupName" value={formData.newGroupName} onChange={handleChange} required className="mt-2"/>
                        )}
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <Input label="Joining Fee" name="joiningFee" type="number" step="0.01" value={formData.joiningFee} onChange={handleChange} required />
                     <Input label="Annual Fee" name="annualFee" type="number" step="0.01" value={formData.annualFee} onChange={handleChange} required />
                </div>
                 <div className="p-4 border rounded-md">
                    <h3 className="font-medium text-gray-700 mb-2">Delegate Options</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Number of Delegates" name="delegates" type="number" value={formData.delegates} onChange={handleChange} required />
                        <Input label="Number of Youth Delegates" name="youthDelegates" type="number" value={formData.youthDelegates} onChange={handleChange} required />
                    </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="primary">Save Level</Button>
                </div>
            </form>
        </Modal>
    );
};

export default LevelFormModal;