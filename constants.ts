import { MembershipGroup, Member, Invoice, FinancialYear, AppSettings } from './types';
import { getCurrentFinancialYear, getFinancialYearForDate } from './utils/dateUtils';

const currentFY = getCurrentFinancialYear();

export const INITIAL_MEMBERSHIP_LEVELS: MembershipGroup[] = [
    {
        groupName: "Associate Member",
        levels: [
            { id: 'am-i', name: "Individual Member", joiningFee: 8, annualFee: 22, delegateOptions: { delegates: 0, youthDelegates: 0 } },
            { id: 'am-s', name: "Student Member", joiningFee: 0, annualFee: 0, delegateOptions: { delegates: 0, youthDelegates: 0 } },
            { id: 'am-hl', name: "Honorary Life Member", joiningFee: 0, annualFee: 0, delegateOptions: { delegates: 0, youthDelegates: 0 } },
        ]
    },
    {
        groupName: "Affiliate Organisation Member",
        levels: [
            { id: 'ao-1d', name: "Organisation 1 Delegate", joiningFee: 11, annualFee: 33, delegateOptions: { delegates: 1, youthDelegates: 0 } },
            { id: 'ao-2d', name: "Organisation 2 Delegates", joiningFee: 22, annualFee: 66, delegateOptions: { delegates: 2, youthDelegates: 0 } },
            { id: 'ao-3d', name: "Organisation 3 Delegates", joiningFee: 33, annualFee: 99, delegateOptions: { delegates: 3, youthDelegates: 0 } },
            { id: 'ao-1d-1y', name: "Organisation 1 Delegate + 1 Youth Delegate", joiningFee: 11, annualFee: 66, delegateOptions: { delegates: 1, youthDelegates: 1 } },
            { id: 'ao-2d-1y', name: "Organisation 2 Delegates + 1 Youth Delegate", joiningFee: 22, annualFee: 99, delegateOptions: { delegates: 2, youthDelegates: 1 } },
            { id: 'ao-3d-1y', name: "Organisation 3 Delegates + 1 Youth Delegate", joiningFee: 33, annualFee: 132, delegateOptions: { delegates: 3, youthDelegates: 1 } },
        ]
    },
    {
        groupName: "Corporate or Government Member",
        levels: [
             { id: 'cgm-1', name: "Corporate Member", joiningFee: 200, annualFee: 500, delegateOptions: { delegates: 3, youthDelegates: 1 } },
        ]
    }
];

export const INITIAL_MEMBERS: Member[] = [
    { 
        id: 'mem-1', name: 'Sydney Community Group', membershipLevelId: 'ao-2d-1y', 
        startDate: currentFY.start, endDate: currentFY.end,
        contactName: 'Jane Doe', telephone: '0298765432', postalAddress: '123 Main St, Sydney NSW 2000',
        isGloballyArchived: false, delegates: [{name: 'Delegate 1', type: 'delegate'}, {name: 'Delegate 2', type: 'delegate'}, {name: 'Youth D.', type: 'youth_delegate'}],
        cancelledFinancialYears: [],
        createdDate: currentFY.start,
    },
    { 
        id: 'mem-2', name: 'Parramatta Multicultural Org', membershipLevelId: 'ao-1d-1y', 
        startDate: currentFY.start, endDate: currentFY.end,
        contactName: 'John Smith', telephone: '0412345678', postalAddress: '45 George St, Parramatta NSW 2150',
        isGloballyArchived: false, delegates: [{name: 'Delegate 1', type: 'delegate'}, {name: 'Youth D.', type: 'youth_delegate'}],
        cancelledFinancialYears: [],
        createdDate: currentFY.start,
    },
     { 
        id: 'mem-3', name: 'Support Services Inc.', membershipLevelId: 'am-s', 
        startDate: currentFY.start, endDate: currentFY.end,
        contactName: 'Emily White', telephone: '0211223344', postalAddress: '55 King St, Sydney NSW 2000',
        isGloballyArchived: false, delegates: [],
        cancelledFinancialYears: [],
        createdDate: currentFY.start,
    },
    { 
        id: 'mem-4', name: 'Global Friends Association', membershipLevelId: 'ao-3d-1y', 
        startDate: new Date(new Date(currentFY.start).setFullYear(new Date(currentFY.start).getFullYear() - 1)).toISOString().split('T')[0], 
        endDate: new Date(new Date(currentFY.end).setFullYear(new Date(currentFY.end).getFullYear() - 1)).toISOString().split('T')[0],
        contactName: 'Carlos Ray', telephone: '0488776655', postalAddress: '200 Pitt St, Sydney NSW 2000',
        isGloballyArchived: true, delegates: [],
        cancelledFinancialYears: [],
        createdDate: new Date(new Date(currentFY.start).setFullYear(new Date(currentFY.start).getFullYear() - 1)).toISOString().split('T')[0],
    },
];

const allLevels = INITIAL_MEMBERSHIP_LEVELS.flatMap(g => g.levels);

export const INITIAL_INVOICES: Invoice[] = [
    {
        id: 'inv-1', memberId: 'mem-1', 
        financialYear: currentFY,
        levelAtTimeOfInvoice: allLevels.find(l => l.id === 'ao-2d-1y')!,
        date: new Date(new Date(currentFY.start).setDate(15)).toISOString().split('T')[0],
        amount: 99, status: 'paid', paidDate: new Date(new Date(currentFY.start).setDate(20)).toISOString().split('T')[0],
        paymentDetails: 'EFT Ref# 12345', amountPaid: 99
    },
     {
        id: 'inv-3', memberId: 'mem-3', 
        financialYear: currentFY,
        levelAtTimeOfInvoice: allLevels.find(l => l.id === 'am-s')!,
        date: new Date(new Date(currentFY.start).setDate(2)).toISOString().split('T')[0],
        amount: 0, status: 'paid', paidDate: new Date(new Date(currentFY.start).setDate(2)).toISOString().split('T')[0],
        paymentDetails: 'Complimentary membership.', amountPaid: 0
    },
     {
        id: 'inv-4', memberId: 'mem-4', 
        financialYear: getFinancialYearForDate(new Date(new Date().setFullYear(new Date().getFullYear()-1))),
        levelAtTimeOfInvoice: allLevels.find(l => l.id === 'ao-3d-1y')!,
        date: new Date(new Date(currentFY.start).setFullYear(new Date(currentFY.start).getFullYear() - 1)).toISOString().split('T')[0],
        amount: 132, status: 'paid', paidDate: new Date(new Date(currentFY.start).setFullYear(new Date(currentFY.start).getFullYear() - 1)).toISOString().split('T')[0],
        paymentDetails: 'EFT Ref# 67890', amountPaid: 132
    }
];

export const DEFAULT_APP_SETTINGS: AppSettings = {
    customLogo: null,
    paymentInstructions: `By EFT:
Account Name: Ethnic Communities Council of NSW
BSB 062-231 Account Number 10214470
Please send remittance to accounts@eccnsw.org.au

By Cheque (mail):
Post cheque to:
Ethnic Communities Council of NSW
221 Cope St, Waterloo NSW 201`,
};