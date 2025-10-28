export interface MembershipLevel {
    id: string;
    name: string;
    joiningFee: number;
    annualFee: number;
    delegateOptions: {
        delegates: number;
        youthDelegates: number;
    };
}

export interface MembershipGroup {
    groupName: string;
    levels: MembershipLevel[];
}

export enum MemberStatus {
    Paid = 'Paid',
    Unpaid = 'Unpaid',
    Pending = 'Pending',
    PartiallyPaid = 'Partially Paid',
}

export interface Delegate {
    name: string;
    type: 'delegate' | 'youth_delegate';
}

export interface Member {
    id: string;
    name: string;
    membershipLevelId: string;
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    contactName: string;
    telephone: string;
    postalAddress: string;
    isGloballyArchived: boolean;
    archivedDate?: string; // YYYY-MM-DD
    delegates: Delegate[];
    status?: MemberStatus; // This will be calculated dynamically
    cancelledFinancialYears: string[]; // e.g., ['2023-2024']
    createdDate?: string; // YYYY-MM-DD
}

export interface FinancialYear {
    start: string; // YYYY-MM-DD
    end: string; // YYYY-MM-DD
    label: string; // e.g., '2023-2024'
}

export interface Invoice {
    id: string;
    memberId: string;
    financialYear: FinancialYear;
    levelAtTimeOfInvoice: MembershipLevel;
    date: string; // YYYY-MM-DD
    dueDate?: string; // YYYY-MM-DD
    amount: number;
    status: 'paid' | 'unpaid' | 'partially-paid' | 'void';
    paidDate?: string;
    paymentDetails?: string;
    amountPaid?: number;
    notes?: string;
    includeJoiningFee?: boolean;
    numberOfYears?: number;
}

export interface AdminProfileData {
    name: string;
    email: string;
}

export interface AppSettings {
    customLogo: string | null;
    paymentInstructions: string;
}


export type Page = 'LOGIN' | 'DASHBOARD' | 'MEMBERS' | 'LEVELS' | 'SETTINGS' | 'PROFILE';

export type ModalView =
  | { type: 'ADD_MEMBER' }
  | { type: 'EDIT_MEMBER'; member: Member }
  | { type: 'VIEW_MEMBER'; member: Member & { status: MemberStatus } }
  | { type: 'INVOICE_BULK' }
  | { type: 'PAYMENT'; invoice: Invoice; fromView?: 'LIST' | 'DETAILS' }
  | { type: 'GENERATE_SINGLE_INVOICE'; member: Member & { status: MemberStatus } }
  | { type: 'ADD_LEVEL' }
  | { type: 'EDIT_LEVEL'; level: MembershipLevel; groupName: string };

export type NotificationModalView =
  | { type: 'ALERT'; title: string; message: string; onClose?: () => void }
  | { type: 'CONFIRM'; title: string; message: string; onConfirm: () => void; confirmVariant?: 'primary' | 'danger', confirmText?: string };