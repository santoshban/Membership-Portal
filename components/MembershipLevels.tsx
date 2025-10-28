import React from 'react';
import { MembershipGroup, MembershipLevel, Member } from '../types';
import Button from './common/Button';
import { PlusCircleIcon, EditIcon } from './icons';

interface MembershipLevelsProps {
    membershipLevels: MembershipGroup[];
    members: Member[];
    onAddLevel: () => void;
    onEditLevel: (level: MembershipLevel, groupName: string) => void;
}

const MembershipLevels: React.FC<MembershipLevelsProps> = ({ membershipLevels, members, onAddLevel, onEditLevel }) => {

    const getMemberCount = (levelId: string) => {
        // FIX: Renamed isArchived to isGloballyArchived to match the Member type.
        return members.filter(m => m.membershipLevelId === levelId && !m.isGloballyArchived).length;
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-700">Membership Levels</h2>
                <Button onClick={onAddLevel} variant="primary">
                    <PlusCircleIcon className="w-5 h-5 mr-2" />
                    Add New Level
                </Button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Joining Fee</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Annual Fee</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Members</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {membershipLevels.flatMap(group => group.levels.map(level => (
                            <tr key={level.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{level.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{group.groupName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right font-mono">${level.joiningFee.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right font-mono">${level.annualFee.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">{getMemberCount(level.id)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Button size="sm" variant="icon" onClick={() => onEditLevel(level, group.groupName)} title="Edit Level">
                                        <EditIcon />
                                    </Button>
                                </td>
                            </tr>
                        )))}
                         {membershipLevels.length === 0 && (
                            <tr>
                                <td colSpan={6} className="text-center py-10 text-gray-500">No membership levels defined.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MembershipLevels;