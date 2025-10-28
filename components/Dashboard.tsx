import React, { useMemo } from 'react';
import { Member, Invoice, MemberStatus, FinancialYear } from '../types';
import { UsersIcon, CheckCircleIcon, XCircleIcon, ClockIcon, TrendingUpIcon, DollarSignIcon, PlusCircleIcon } from './icons';
import DonutChart from './DonutChart';

interface DashboardProps {
    members: (Member & { status: MemberStatus })[];
    invoices: Invoice[];
    financialYear: FinancialYear;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-white p-5 rounded-lg shadow-md flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-full mr-4 ${color}`}>
            {icon}
        </div>
        <div>
            <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
        </div>
    </div>
);


const Dashboard: React.FC<DashboardProps> = ({ members, invoices, financialYear }) => {
    const dashboardStats = useMemo(() => {
        const activeMembers = members.filter(m => !m.isGloballyArchived);
        const totalMembers = activeMembers.length;
        const paidCount = activeMembers.filter(m => m.status === MemberStatus.Paid).length;
        const unpaidCount = activeMembers.filter(m => m.status === MemberStatus.Unpaid).length;
        const pendingCount = activeMembers.filter(m => m.status === MemberStatus.Pending).length;
        const partiallyPaidCount = activeMembers.filter(m => m.status === MemberStatus.PartiallyPaid).length;

        const fyStartDate = new Date(financialYear.start);
        const fyEndDate = new Date(financialYear.end);
        
        const totalRevenue = invoices
            .filter(inv => inv.status === 'paid' && inv.paidDate && new Date(inv.paidDate) >= fyStartDate && new Date(inv.paidDate) <= fyEndDate)
            .reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);

        return { totalMembers, paidCount, unpaidCount, pendingCount, partiallyPaidCount, totalRevenue };
    }, [members, invoices, financialYear]);

    const donutChartData = [
        { value: dashboardStats.paidCount, color: '#10B981', label: 'Paid' },
        { value: dashboardStats.unpaidCount, color: '#EF4444', label: 'Unpaid' },
        { value: dashboardStats.partiallyPaidCount, color: '#F59E0B', label: 'Partially Paid' },
        { value: dashboardStats.pendingCount, color: '#FBBF24', label: 'Pending' }
    ].filter(d => d.value > 0);
    
     const recentActivities = useMemo(() => {
        const recentPayments = invoices
            .filter(inv => inv.status === 'paid' && inv.paidDate)
            .sort((a, b) => new Date(b.paidDate!).getTime() - new Date(a.paidDate!).getTime())
            .slice(0, 5)
            .map(inv => {
                const member = members.find(m => m.id === inv.memberId);
                return {
                    type: 'payment' as const,
                    date: new Date(inv.paidDate!),
                    description: `Payment of $${(inv.amountPaid || 0).toFixed(2)} received from`,
                    subject: member?.name || 'Unknown Member'
                };
            });

        const newMembers = members
            .filter(mem => mem.createdDate)
            .sort((a, b) => new Date(b.createdDate!).getTime() - new Date(a.createdDate!).getTime())
            .slice(0, 5)
            .map(mem => ({
                type: 'new_member' as const,
                date: new Date(mem.createdDate!),
                description: 'New member added:',
                subject: mem.name
            }));

        return [...recentPayments, ...newMembers]
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, 7);
    }, [members, invoices]);

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-700">Dashboard Overview ({financialYear.label})</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <StatCard 
                    title="Total Active Members"
                    value={dashboardStats.totalMembers}
                    icon={<UsersIcon className="w-6 h-6 text-white"/>}
                    color="bg-blue-500"
                />
                 <StatCard 
                    title="Paid Members"
                    value={dashboardStats.paidCount}
                    icon={<CheckCircleIcon className="w-6 h-6 text-white"/>}
                    color="bg-green-500"
                />
                 <StatCard 
                    title="Outstanding"
                    value={dashboardStats.unpaidCount + dashboardStats.pendingCount + dashboardStats.partiallyPaidCount}
                    icon={<ClockIcon className="w-6 h-6 text-white"/>}
                    color="bg-amber-500"
                />
                 <StatCard 
                    title="Total Revenue"
                    value={`$${dashboardStats.totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
                    icon={<TrendingUpIcon className="w-6 h-6 text-white"/>}
                    color="bg-purple-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                    <h3 className="font-semibold text-lg text-gray-800 mb-4">Member Status Breakdown</h3>
                    <div className="h-64">
                        <DonutChart data={donutChartData} />
                    </div>
                </div>
                <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-md">
                    <h3 className="font-semibold text-lg text-gray-800 mb-4">Recent Activity</h3>
                    <ul className="space-y-4">
                        {recentActivities.length > 0 ? recentActivities.map((activity, index) => (
                             <li key={index} className="flex items-center space-x-4">
                                <div className={`p-2 rounded-full ${activity.type === 'payment' ? 'bg-green-100' : 'bg-blue-100'}`}>
                                    {activity.type === 'payment' 
                                        ? <DollarSignIcon className="w-5 h-5 text-green-600" /> 
                                        : <PlusCircleIcon className="w-5 h-5 text-blue-600" />}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-800">
                                        {activity.description} <span className="font-semibold">{activity.subject}</span>
                                    </p>
                                </div>
                                 <p className="text-sm text-gray-500">{activity.date.toLocaleDateString('en-AU')}</p>
                            </li>
                        )) : (
                            <p className="text-center text-gray-500 py-4">No recent activities to display.</p>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;