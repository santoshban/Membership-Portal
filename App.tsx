import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Member, MembershipLevel, Invoice, MemberStatus, FinancialYear, Page, ModalView, MembershipGroup, AdminProfileData, NotificationModalView, AppSettings } from './types';
import { INITIAL_MEMBERSHIP_LEVELS, INITIAL_MEMBERS, INITIAL_INVOICES, DEFAULT_APP_SETTINGS } from './constants';
import { getCurrentFinancialYear, getFinancialYears } from './utils/dateUtils';
import useLocalStorage from './hooks/useLocalStorage';
import Header from './components/Header';
import MemberList from './components/MemberList';
import MemberFormModal from './components/MemberFormModal';
import InvoiceModal from './components/InvoiceModal';
import PaymentModal from './components/PaymentModal';
import MemberDetailsModal from './components/MemberDetailsModal';
import GenerateSingleInvoiceModal from './components/GenerateSingleInvoiceModal';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MembershipLevels from './components/MembershipLevels';
import LevelFormModal from './components/LevelFormModal';
import Profile from './components/Profile';
import Settings from './components/Settings';
import AlertModal from './components/common/AlertModal';
import ConfirmModal from './components/common/ConfirmModal';

const SESSION_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

const App: React.FC = () => {
    // STATE
    const [modal, setModal] = useState<ModalView | null>(null);
    const [notificationModal, setNotificationModal] = useState<NotificationModalView | null>(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Persisted State
    const [page, setPage] = useLocalStorage<Page>('currentPage', 'LOGIN');
    const [members, setMembers] = useLocalStorage<Member[]>('members', INITIAL_MEMBERS);
    const [invoices, setInvoices] = useLocalStorage<Invoice[]>('invoices', INITIAL_INVOICES);
    const [membershipLevels, setMembershipLevels] = useLocalStorage<MembershipGroup[]>('membershipLevels', INITIAL_MEMBERSHIP_LEVELS);
    const [adminPassword, setAdminPassword] = useLocalStorage<string>('adminPassword', 'admin123');
    const [adminProfile, setAdminProfile] = useLocalStorage<AdminProfileData>('adminProfile', { name: 'Admin User', email: 'admin@eccnsw.org.au' });
    const [loginTimestamps, setLoginTimestamps] = useLocalStorage<string[]>('loginTimestamps', []);
    const [logoutTimestamps, setLogoutTimestamps] = useLocalStorage<string[]>('logoutTimestamps', []);
    const [settings, setSettings] = useLocalStorage<AppSettings>('appSettings', DEFAULT_APP_SETTINGS);
    
    const timeoutRef = useRef<number | null>(null);
    
    const [selectedFinancialYear, setSelectedFinancialYear] = useState<FinancialYear>(getCurrentFinancialYear());

    // DERIVED STATE
    const financialYears = useMemo(() => getFinancialYears(), []);

    const membersWithStatus = useMemo(() => {
        const isInvoiceCoveringFY = (fyLabel: string, invoice: Invoice): boolean => {
            if (invoice.status === 'void') return false;
            const targetFYStartYear = parseInt(fyLabel.split('-')[0], 10);
            const invoiceFYStartYear = parseInt(invoice.financialYear.label.split('-')[0], 10);
            const coverage = invoice.numberOfYears || 1;
            return targetFYStartYear >= invoiceFYStartYear && targetFYStartYear < (invoiceFYStartYear + coverage);
        };
    
        return members.map(member => {
            const invoicesCoveringSelectedFY = invoices.filter(inv =>
                inv.memberId === member.id && isInvoiceCoveringFY(selectedFinancialYear.label, inv)
            );
    
            const isPaidForSelectedFY = invoicesCoveringSelectedFY.some(inv => inv.status === 'paid');
            const isPartiallyPaidForSelectedFY = invoicesCoveringSelectedFY.some(inv => inv.status === 'partially-paid');
    
            const latestInvoiceCoveringSelectedFY = invoicesCoveringSelectedFY.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
            // Start with the base member data.
            let displayMember = { ...member };
    
            // If an invoice exists covering the selected FY, it dictates the membership level for that year's view.
            if (latestInvoiceCoveringSelectedFY) {
                displayMember.membershipLevelId = latestInvoiceCoveringSelectedFY.levelAtTimeOfInvoice.id;
            }
    
            let status: MemberStatus;
    
            if (isPaidForSelectedFY) {
                status = MemberStatus.Paid;
            } else if (isPartiallyPaidForSelectedFY) {
                status = MemberStatus.PartiallyPaid;
            } else if (latestInvoiceCoveringSelectedFY) {
                // an invoice exists covering this year but it's not paid
                status = MemberStatus.Unpaid;
            } else {
                // No invoice for this year. Is it past due?
                const oneMonthAfterStart = new Date(selectedFinancialYear.start);
                oneMonthAfterStart.setMonth(oneMonthAfterStart.getMonth() + 1);
                if (new Date() > oneMonthAfterStart && new Date(selectedFinancialYear.start) < new Date()) {
                    status = MemberStatus.Unpaid;
                } else {
                    status = MemberStatus.Pending;
                }
            }
    
            return { ...displayMember, status, hasInvoice: !!latestInvoiceCoveringSelectedFY };
        });
    }, [members, invoices, selectedFinancialYear]);

    // HANDLERS
    const handleLogout = useCallback(() => {
        setLogoutTimestamps(prev => [new Date().toISOString(), ...prev.slice(0, 9)]);
        setPage('LOGIN');
        setNotificationModal(null); // Ensure any open modals are closed on logout
    }, [setLogoutTimestamps, setPage]);

    // Session Timeout Logic
    const resetTimeout = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = window.setTimeout(() => {
            setNotificationModal({
                type: 'ALERT',
                title: 'Session Expired',
                message: 'Your session has expired due to inactivity. You will now be logged out.',
                onClose: handleLogout,
            });
        }, SESSION_TIMEOUT_MS);
    }, [handleLogout]);

    useEffect(() => {
        if (page !== 'LOGIN') {
            const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
            
            resetTimeout(); // Start the timer when logged in
            
            events.forEach(event => window.addEventListener(event, resetTimeout));

            return () => {
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
                events.forEach(event => window.removeEventListener(event, resetTimeout));
            };
        }
    }, [page, resetTimeout]);


    const handleLogin = (password: string) => {
        if (password === adminPassword) {
            setLoginTimestamps(prev => [new Date().toISOString(), ...prev.slice(0, 9)]);
            setPage('DASHBOARD');
            return true;
        }
        return false;
    };
    
    const handleUpdateAdminProfile = (data: AdminProfileData) => {
        setAdminProfile(data);
    };

    const handleUpdatePassword = (newPassword: string) => {
        setAdminPassword(newPassword);
    };
    
    const handleResetData = () => {
        setNotificationModal({
            type: 'CONFIRM',
            title: 'Reset Application Data',
            message: 'Are you sure you want to reset all data? This will restore the application to its initial sample state and cannot be undone.',
            confirmVariant: 'danger',
            confirmText: 'Reset Data',
            onConfirm: () => {
                localStorage.clear();
                window.location.reload();
            }
        });
    };

    const handleExportData = () => {
        try {
            const dataToExport = {
                version: '1.0.0',
                exportedAt: new Date().toISOString(),
                data: {
                    members,
                    invoices,
                    membershipLevels,
                    adminPassword,
                    adminProfile,
                    settings,
                }
            };
            const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
                JSON.stringify(dataToExport, null, 2)
            )}`;
            const link = document.createElement("a");
            link.href = jsonString;
            const date = new Date().toISOString().split('T')[0];
            link.download = `membership_data_backup_${date}.json`;
            link.click();
            setNotificationModal({
                type: 'ALERT',
                title: 'Export Successful',
                message: 'Your data has been successfully exported.'
            });
        } catch (error) {
            console.error("Failed to export data:", error);
            setNotificationModal({
                type: 'ALERT',
                title: 'Export Failed',
                message: 'An error occurred while exporting your data. Please check the console for details.'
            });
        }
    };

    const handleImportData = (fileContent: string) => {
        setNotificationModal({
            type: 'CONFIRM',
            title: 'Import Data',
            message: 'Are you sure you want to import this data? All current data will be overwritten. This action cannot be undone.',
            confirmVariant: 'danger',
            confirmText: 'Import & Overwrite',
            onConfirm: () => {
                try {
                    const importedObject = JSON.parse(fileContent);
                    // Basic validation
                    if (!importedObject.data || !importedObject.data.members || !importedObject.data.invoices) {
                         throw new Error('Invalid or corrupted data file.');
                    }
    
                    // Set all data from the imported file
                    setMembers(importedObject.data.members);
                    setInvoices(importedObject.data.invoices);
                    setMembershipLevels(importedObject.data.membershipLevels);
                    setAdminPassword(importedObject.data.adminPassword);
                    setAdminProfile(importedObject.data.adminProfile);
                    setSettings(importedObject.data.settings);
                    
                    setNotificationModal({
                        type: 'ALERT',
                        title: 'Import Successful',
                        message: 'Data imported successfully. The application will now reload.',
                        onClose: () => {
                            window.location.reload();
                        }
                    });
    
                } catch (error) {
                    console.error("Failed to import data:", error);
                     setNotificationModal({
                        type: 'ALERT',
                        title: 'Import Failed',
                        message: `An error occurred while importing data: ${error instanceof Error ? error.message : 'Unknown error'}`
                    });
                }
            }
        });
    };

    const handleSaveMember = (member: Member) => {
        const allLevels = membershipLevels.flatMap(g => g.levels);
        if (modal?.type === 'ADD_MEMBER') {
            const newMember = { 
                ...member, 
                id: `mem-${Date.now()}`,
                createdDate: new Date().toISOString(),
            };
            setMembers(prev => [...prev, newMember]);
            const level = allLevels.find(l => l.id === newMember.membershipLevelId);
            if (level) {
                const joiningFee = level.joiningFee > 0 ? level.joiningFee : 0;
                const totalAmount = level.annualFee + joiningFee;

                const defaultDueDate = new Date();
                defaultDueDate.setDate(defaultDueDate.getDate() + 30);

                const newInvoice: Invoice = {
                    id: `inv-${Date.now()}`,
                    memberId: newMember.id,
                    financialYear: selectedFinancialYear,
                    levelAtTimeOfInvoice: level,
                    date: new Date().toISOString().split('T')[0],
                    dueDate: defaultDueDate.toISOString().split('T')[0],
                    amount: totalAmount,
                    status: totalAmount > 0 ? 'unpaid' : 'paid',
                    paidDate: totalAmount === 0 ? new Date().toISOString().split('T')[0] : undefined,
                    paymentDetails: totalAmount === 0 ? 'Complimentary membership.' : undefined,
                    amountPaid: totalAmount === 0 ? 0 : 0,
                    includeJoiningFee: joiningFee > 0,
                };
                setInvoices(prev => [...prev, newInvoice]);
            }
        } else if (modal?.type === 'EDIT_MEMBER' && 'member' in modal) {
             setMembers(prev => prev.map(m => m.id === modal.member.id ? { ...m, ...member, id: modal.member.id } : m));
        }
        setModal(null);
    };
    
    const handleSaveLevel = (level: MembershipLevel, groupName: string) => {
        if (!level.name || !groupName) {
            setNotificationModal({
                type: 'ALERT',
                title: 'Validation Error',
                message: 'Level Name and Group Name are required.',
            });
            return;
        }

        setMembershipLevels(prev => {
            const newGroups = [...prev];
            const groupIndex = newGroups.findIndex(g => g.groupName === groupName);

            if (groupIndex > -1) { // Existing group
                const levelIndex = newGroups[groupIndex].levels.findIndex(l => l.id === level.id);
                if (levelIndex > -1) { // Existing level, update it
                    newGroups[groupIndex].levels[levelIndex] = level;
                } else { // New level in existing group
                     newGroups[groupIndex].levels.push(level);
                }
            } else { // New group
                newGroups.push({ groupName, levels: [level] });
            }
            return newGroups;
        });
        setModal(null);
    };

    const handleGenerateInvoices = (newInvoices: Invoice[]) => {
        if (newInvoices.length === 0) {
             setNotificationModal({
                type: 'ALERT',
                title: 'No Invoices Generated',
                message: 'No new invoices were generated based on the current selection and filters.'
            });
        } else {
            setInvoices(prev => [...prev, ...newInvoices]);
        }
        setModal(null);
    };
    
    const handleSavePayment = (invoice: Invoice) => {
        setInvoices(prev => prev.map(inv => inv.id === invoice.id ? invoice : inv));

        if (invoice.status === 'paid' && invoice.numberOfYears && invoice.numberOfYears > 1) {
            setMembers(prev => prev.map(m => {
                if (m.id === invoice.memberId) {
                    const financialYearStart = parseInt(invoice.financialYear.label.split('-')[0], 10);
                    const newEndYear = financialYearStart + invoice.numberOfYears;
                    return { ...m, endDate: `${newEndYear}-06-30` };
                }
                return m;
            }));
        }

        if(modal?.type === 'PAYMENT' && modal.fromView === 'DETAILS' && 'invoice' in modal) {
            const member = membersWithStatus.find(m => m.id === invoice.memberId);
            if (member) setModal({ type: 'VIEW_MEMBER', member });
            else setModal(null);
        } else {
            setModal(null);
        }
    };
    
    const handleVoidInvoice = (invoiceId: string) => {
        setNotificationModal({
            type: 'CONFIRM',
            title: 'Void Invoice',
            message: 'Are you sure you want to void this invoice? This action cannot be undone.',
            confirmVariant: 'danger',
            confirmText: 'Void',
            onConfirm: () => {
                setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status: 'void', amountPaid: 0 } : inv));
                setNotificationModal(null);
            }
        });
    };

    const handleMarkAsPaid = (invoiceId: string) => {
        let paidInvoice: Invoice | undefined;
        setInvoices(prev => prev.map(inv => {
            if (inv.id === invoiceId) {
                paidInvoice = {
                    ...inv,
                    status: 'paid',
                    amountPaid: inv.amount,
                    paidDate: new Date().toISOString().split('T')[0],
                    paymentDetails: `${inv.paymentDetails || ''}\n[${new Date().toISOString().split('T')[0]}] Marked as fully paid.`.trim()
                };
                 return paidInvoice;
            }
            return inv;
        }));

        if (paidInvoice?.status === 'paid' && paidInvoice.numberOfYears && paidInvoice.numberOfYears > 1) {
            setMembers(prev => prev.map(m => {
                if (m.id === paidInvoice!.memberId) {
                    const financialYearStart = parseInt(paidInvoice!.financialYear.label.split('-')[0], 10);
                    const newEndYear = financialYearStart + paidInvoice!.numberOfYears;
                    return { ...m, endDate: `${newEndYear}-06-30` };
                }
                return m;
            }));
        }
    };
    
    const handleSaveSingleInvoice = (invoice: Invoice) => {
        setInvoices(prev => [...prev, invoice]);
        if (modal?.type === 'GENERATE_SINGLE_INVOICE') {
             setModal({ type: 'VIEW_MEMBER', member: modal.member });
        }
    };
    
    const handleToggleYearCancellation = (memberId: string, financialYearLabel: string) => {
        setMembers(prev => prev.map(m => {
            if (m.id === memberId) {
                const cancelledYears = m.cancelledFinancialYears || [];
                const isCancelled = cancelledYears.includes(financialYearLabel);
                const newCancelledYears = isCancelled
                    ? cancelledYears.filter(fy => fy !== financialYearLabel)
                    : [...cancelledYears, financialYearLabel];
                return { ...m, cancelledFinancialYears: newCancelledYears };
            }
            return m;
        }));
    };
    
    const handleCancellationRequest = (member: Member, financialYear: FinancialYear) => {
        const isCancelled = member.cancelledFinancialYears?.includes(financialYear.label);
        const action = isCancelled ? 'restore' : 'cancel';
        const capitalizedAction = action.charAt(0).toUpperCase() + action.slice(1);

        setNotificationModal({
            type: 'CONFIRM',
            title: `${capitalizedAction} Membership for ${financialYear.label}`,
            message: `Are you sure you want to ${action} '${member.name}'s' membership for the ${financialYear.label} financial year? Their data for other years will not be affected.`,
            confirmVariant: action === 'cancel' ? 'danger' : 'primary',
            confirmText: capitalizedAction,
            onConfirm: () => {
                handleToggleYearCancellation(member.id, financialYear.label);
                setNotificationModal(null); 
                setTimeout(() => { 
                  setNotificationModal({
                      type: 'ALERT',
                      title: 'Success',
                      message: `Member '${member.name}' has been ${action}led for ${financialYear.label}.`
                  });
                }, 100);
            }
        });
    };

    const openPaymentModal = (memberId: string) => {
        const memberInvoices = invoices.filter(inv => inv.memberId === memberId && inv.financialYear.label === selectedFinancialYear.label && inv.status !== 'void');
        const unpaidInvoice = memberInvoices.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).find(inv => inv.status !== 'paid');
        if (unpaidInvoice) {
            setModal({ type: 'PAYMENT', invoice: unpaidInvoice, fromView: 'LIST' });
        } else {
             setNotificationModal({
                type: 'ALERT',
                title: 'No Invoice Found',
                message: 'No outstanding invoice for this member in the selected financial year.'
            });
        }
    };
    
    // RENDER LOGIC
    if (page === 'LOGIN') {
        return <Login onLogin={handleLogin} />;
    }
    
    const pageTitles: Record<Page, string> = {
        LOGIN: 'Login',
        DASHBOARD: 'Dashboard',
        MEMBERS: 'Member Management',
        LEVELS: 'Settings - Membership Levels',
        SETTINGS: 'Settings - General',
        PROFILE: 'Admin Profile'
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans text-gray-800 flex">
            <Sidebar 
              currentPage={page} 
              onNavigate={setPage} 
              onLogout={handleLogout}
              isCollapsed={isSidebarCollapsed}
              logo={settings.customLogo}
            />
            
            <div className={`flex-1 flex flex-col h-screen transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                <Header title={pageTitles[page]} onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
                    {page === 'DASHBOARD' && <Dashboard members={membersWithStatus} invoices={invoices} financialYear={selectedFinancialYear} />}
                    {page === 'MEMBERS' && (
                        <MemberList
                            members={membersWithStatus}
                            membershipLevels={membershipLevels}
                            onEditMember={(member) => setModal({ type: 'EDIT_MEMBER', member })}
                            onViewMember={(member) => setModal({ type: 'VIEW_MEMBER', member })}
                            onConfirmCancellation={handleCancellationRequest}
                            onUpdatePaymentStatus={openPaymentModal}
                            onAddMember={() => setModal({ type: 'ADD_MEMBER' })}
                            onGenerateInvoices={() => setModal({ type: 'INVOICE_BULK' })}
                            financialYears={financialYears}
                            selectedFinancialYear={selectedFinancialYear}
                            setSelectedFinancialYear={setSelectedFinancialYear}
                        />
                    )}
                     {page === 'SETTINGS' && (
                        <Settings
                            settings={settings}
                            onUpdateSettings={setSettings}
                        />
                    )}
                    {page === 'LEVELS' && (
                        <MembershipLevels 
                            membershipLevels={membershipLevels}
                            members={members}
                            onAddLevel={() => setModal({ type: 'ADD_LEVEL' })}
                            onEditLevel={(level, groupName) => setModal({ type: 'EDIT_LEVEL', level, groupName })}
                        />
                    )}
                    {page === 'PROFILE' && (
                        <Profile 
                            adminProfile={adminProfile}
                            onUpdateAdminProfile={handleUpdateAdminProfile}
                            currentPassword={adminPassword}
                            onUpdatePassword={handleUpdatePassword}
                            loginTimestamps={loginTimestamps}
                            logoutTimestamps={logoutTimestamps}
                            onResetData={handleResetData}
                            onExportData={handleExportData}
                            onImportData={handleImportData}
                        />
                    )}
                </main>
            </div>

            {/* MODALS */}
            {modal?.type === 'ADD_MEMBER' && (
                <MemberFormModal isOpen={true} onClose={() => setModal(null)} onSave={handleSaveMember} financialYear={selectedFinancialYear} membershipLevels={membershipLevels} />
            )}
            
            {modal?.type === 'EDIT_MEMBER' && (
                <MemberFormModal isOpen={true} onClose={() => setModal(null)} onSave={handleSaveMember} member={modal.member} financialYear={selectedFinancialYear} membershipLevels={membershipLevels} />
            )}

            {modal?.type === 'VIEW_MEMBER' && (
                <MemberDetailsModal
                    isOpen={true}
                    onClose={() => setModal(null)}
                    member={modal.member}
                    invoices={invoices.filter(i => i.memberId === modal.member.id)}
                    onVoidInvoice={handleVoidInvoice}
                    onMarkAsPaid={handleMarkAsPaid}
                    onEditPayment={(invoice) => setModal({ type: 'PAYMENT', invoice, fromView: 'DETAILS' })}
                    onGenerateNewInvoice={() => setModal({ type: 'GENERATE_SINGLE_INVOICE', member: modal.member })}
                    settings={settings}
                />
            )}
            
            {modal?.type === 'ADD_LEVEL' && (
                <LevelFormModal isOpen={true} onClose={() => setModal(null)} onSave={handleSaveLevel} membershipLevels={membershipLevels} />
            )}
            
            {modal?.type === 'EDIT_LEVEL' && (
                <LevelFormModal isOpen={true} onClose={() => setModal(null)} onSave={handleSaveLevel} level={modal.level} groupName={modal.groupName} membershipLevels={membershipLevels} />
            )}

            {modal?.type === 'GENERATE_SINGLE_INVOICE' && (
                 <GenerateSingleInvoiceModal isOpen={true} onClose={() => setModal({ type: 'VIEW_MEMBER', member: modal.member })} member={modal.member} onSave={handleSaveSingleInvoice} financialYears={financialYears} existingInvoices={invoices} membershipLevels={membershipLevels} settings={settings} />
            )}
            
            {modal?.type === 'INVOICE_BULK' && (
                <InvoiceModal isOpen={true} onClose={() => setModal(null)} members={membersWithStatus} onGenerate={handleGenerateInvoices} financialYear={selectedFinancialYear} existingInvoices={invoices} financialYears={financialYears} membershipLevels={membershipLevels} settings={settings} />
            )}

            {modal?.type === 'PAYMENT' && (
                 <PaymentModal
                    isOpen={true}
                    onClose={() => {
                       if (modal.fromView === 'DETAILS') {
                           const member = membersWithStatus.find(m => m.id === modal.invoice.memberId);
                           if (member) setModal({ type: 'VIEW_MEMBER', member });
                           else setModal(null);
                       } else {
                           setModal(null);
                       }
                    }}
                    onSave={handleSavePayment}
                    invoice={modal.invoice}
                 />
            )}

            {/* Notification Modals */}
            {notificationModal?.type === 'ALERT' && (
                <AlertModal
                    isOpen={true}
                    title={notificationModal.title}
                    message={notificationModal.message}
                    onClose={() => {
                        if (notificationModal.onClose) {
                            notificationModal.onClose();
                        }
                        setNotificationModal(null);
                    }}
                />
            )}
            {notificationModal?.type === 'CONFIRM' && (
                <ConfirmModal
                    isOpen={true}
                    title={notificationModal.title}
                    message={notificationModal.message}
                    onConfirm={notificationModal.onConfirm}
                    onClose={() => setNotificationModal(null)}
                    confirmVariant={notificationModal.confirmVariant}
                    confirmText={notificationModal.confirmText}
                />
            )}
        </div>
    );
};

export default App;