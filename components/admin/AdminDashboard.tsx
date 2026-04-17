
import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { Dealer, AuditLog } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import Table from '../common/Table';
import Badge from '../common/Badge';
import { formatDateTime, downloadCSV, copyToClipboard } from '../../utils/helpers';
import DealerForm from './DealerForm';
import Modal from '../common/Modal';
import UniversalEmployeeSearchPage from '../dealer/UniversalEmployeeSearchPage';
import Alert from '../common/Alert';
import ActivityMonitorPage from './ActivityMonitorPage';
import Input from '../common/Input';
import ImportCSVModal from './ImportCSVModal';

const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-1a6 6 0 00-5.176-5.973" />
    </svg>
);

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const TerminationIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
);

interface AdminDashboardProps {
  currentPage?: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentPage = 'Dashboard' }) => {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDealerModalOpen, setIsDealerModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);
  const [dealerToReset, setDealerToReset] = useState<Dealer | null>(null);
  const [dealerToDelete, setDealerToDelete] = useState<Dealer | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [globalError, setGlobalError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
      try {
        setGlobalError('');
        setIsLoading(true);
        const [dealersData, auditLogsData] = await Promise.all([
            api.getDealers(),
            api.getAuditLogs()
        ]);
        setDealers(dealersData);
        setAuditLogs(auditLogsData);
      } catch (err) {
        setGlobalError('Failed to fetch initial data. Please try again.');
      } finally {
        setIsLoading(false);
      }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDealer = () => {
    setSelectedDealer(null);
    setFormError('');
    setIsDealerModalOpen(true);
  };
  
  const handleEditDealer = (dealer: Dealer) => {
    setSelectedDealer(dealer);
    setFormError('');
    setIsDealerModalOpen(true);
  };

  const handleSaveDealer = async (formData: Omit<Dealer, 'id' | 'status' | 'created_at' | 'user_id'> & { username: string }) => {
    setFormError('');
    try {
        if (selectedDealer) { // Editing existing dealer
            const { username, ...updateData } = formData;
            await api.updateDealer(selectedDealer.id, updateData);
        } else { // Creating new dealer
            const newDealer = await api.createDealer(formData);
            setTempPassword(newDealer.tempPass);
            setSuccessMessage(`Dealer "${newDealer.dealer.company_name}" created.`);
            setIsSuccessModalOpen(true);
        }
        setIsDealerModalOpen(false);
        setSelectedDealer(null);
        fetchData();
    } catch (err) {
        setFormError((err as Error).message);
    }
  };

  const handleOpenResetModal = (dealer: Dealer) => {
    setDealerToReset(dealer);
    setIsResetModalOpen(true);
  };

  const handleConfirmReset = async () => {
    if (dealerToReset) {
      setGlobalError('');
      try {
        const newTempPass = await api.resetDealerPassword(dealerToReset.user_id);
        setTempPassword(newTempPass);
        setSuccessMessage(`Password for ${dealerToReset.company_name} has been reset. Please share the new temporary password securely.`);
        setIsSuccessModalOpen(true);
      } catch (err) {
        setGlobalError((err as Error).message);
      } finally {
        setIsResetModalOpen(false);
        setDealerToReset(null);
      }
    }
  };
  
  const handleOpenDeleteModal = (dealer: Dealer) => {
    setDealerToDelete(dealer);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (dealerToDelete) {
        setGlobalError('');
        try {
            await api.deleteDealer(dealerToDelete.id);
            fetchData();
        } catch (err) {
            setGlobalError((err as Error).message);
        } finally {
            setIsDeleteModalOpen(false);
            setDealerToDelete(null);
        }
    }
  };

  const handleExportDealers = () => downloadCSV(filteredDealers, 'dealers_export');
  const handleExportLogs = () => downloadCSV(auditLogs, 'auditlog_export');

  const recentSearches = auditLogs.filter(log => log.action_type === 'search').length;
  const recentTerminations = auditLogs.filter(log => log.action_type === 'terminate_employee').length;

  const filteredDealers = useMemo(() => {
    if (!searchQuery) return dealers;
    const lowercasedQuery = searchQuery.toLowerCase();
    return dealers.filter(dealer => 
        dealer.company_name.toLowerCase().includes(lowercasedQuery) ||
        dealer.primary_contact_name.toLowerCase().includes(lowercasedQuery) ||
        dealer.primary_contact_email.toLowerCase().includes(lowercasedQuery)
    );
  }, [dealers, searchQuery]);

  const renderStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <Card>
        <div className="flex items-center">
          <UsersIcon />
          <div className="ml-4">
            <p className="text-lg font-semibold text-gray-700">{dealers.length}</p>
            <p className="text-sm text-gray-500">Total Dealers</p>
          </div>
        </div>
      </Card>
      <Card>
        <div className="flex items-center">
          <SearchIcon />
          <div className="ml-4">
            <p className="text-lg font-semibold text-gray-700">{recentSearches}</p>
            <p className="text-sm text-gray-500">Recent Searches</p>
          </div>
        </div>
      </Card>
      <Card>
        <div className="flex items-center">
          <TerminationIcon />
          <div className="ml-4">
            <p className="text-lg font-semibold text-gray-700">{recentTerminations}</p>
            <p className="text-sm text-gray-500">Recent Terminations</p>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderDealersList = (dealerList: Dealer[], title: string, showActions: boolean) => (
    <Card title={title} actions={showActions &&
      <div className="flex items-center gap-2">
          <Button onClick={() => setIsImportModalOpen(true)} variant="secondary" disabled={isLoading}>Import CSV</Button>
          <Button onClick={handleExportDealers} variant="secondary" disabled={isLoading}>Export CSV</Button>
          <Button onClick={handleCreateDealer} disabled={isLoading}>Create Dealer</Button>
      </div>
    }>
      {showActions && (
          <div className="mb-4">
            <Input 
                placeholder="Search by company, contact, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
      )}
      {isLoading ? (<div className="text-center p-4">Loading dealers...</div>) : 
      dealerList.length === 0 ? <p className="text-center text-gray-500 py-4">No dealers found.</p> : (
        <Table headers={['Company Name', 'Contact', 'Status', 'Actions']}>
          {dealerList.map(dealer => (
            <tr key={dealer.id} className="text-gray-700">
              <td className="px-4 py-3">
                <p className="font-semibold">{dealer.company_name}</p>
                <p className="text-xs text-gray-600">{dealer.address}</p>
              </td>
              <td className="px-4 py-3">
                <p>{dealer.primary_contact_name}</p>
                <p className="text-xs text-gray-600">{dealer.primary_contact_email}</p>
              </td>
              <td className="px-4 py-3">
                <Badge color={dealer.status === 'active' ? 'green' : 'red'}>{dealer.status}</Badge>
              </td>
              <td className="px-4 py-3 space-x-2">
                <Button size="sm" variant="secondary" onClick={() => handleEditDealer(dealer)}>Edit</Button>
                <Button size="sm" variant="secondary" onClick={() => handleOpenResetModal(dealer)}>Reset PW</Button>
                <Button size="sm" variant="danger" onClick={() => handleOpenDeleteModal(dealer)}>Delete</Button>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </Card>
  );

  const renderAuditLogsList = (logList: AuditLog[], title: string, showActions: boolean) => (
    <Card title={title} actions={showActions && <Button onClick={handleExportLogs} variant="secondary" disabled={isLoading}>Export CSV</Button>}>
      {isLoading ? (<div className="text-center p-4">Loading logs...</div>) :
       logList.length === 0 ? <p className="text-center text-gray-500 py-4">No audit logs found.</p> : (
        <Table headers={["Timestamp", "User", "Action", "Details"]}>
        {logList.map(log => (
            <tr key={log.id} className="text-gray-700">
                <td className="px-4 py-3 text-sm">{formatDateTime(log.timestamp)}</td>
                <td className="px-4 py-3 text-sm">{log.who_user_name}</td>
                <td className="px-4 py-3 text-sm capitalize">{log.action_type.replace(/_/g, ' ')}</td>
                <td className="px-4 py-3 text-sm">{log.details}</td>
            </tr>
        ))}
        </Table>
       )}
    </Card>
  );

  const renderDashboardView = () => (
    <>
        {isLoading ? (<div className="text-center p-8 text-gray-500">Loading Dashboard Data...</div>) :
        (<>
            {renderStats()}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {renderDealersList(dealers.slice(0, 5), "Recently Added Dealers", false)}
                {renderAuditLogsList(auditLogs.slice(0, 5), "Recent Activity", false)}
            </div>
        </>)}
    </>
  );

  return (
    <>
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">
        {currentPage === 'Dashboard' ? 'Admin Dashboard' : currentPage}
      </h1>
      
      {globalError && <div className="mb-4"><Alert message={globalError} variant="danger" onClose={() => setGlobalError('')} /></div>}

      {currentPage === 'Dashboard' && renderDashboardView()}
      
      {currentPage === 'Dealers' && (
        <div className="mb-8">{renderDealersList(filteredDealers, "Manage Dealers", true)}</div>
      )}

      {currentPage === 'Audit Logs' && (
        <div className="mb-8">{renderAuditLogsList(auditLogs, "Global Audit Log", true)}</div>
      )}

      {currentPage === 'Universal Search' && (
        <div className="mb-8"><UniversalEmployeeSearchPage /></div>
      )}

      {currentPage === 'Activity Monitor' && (
        <div className="mb-8"><ActivityMonitorPage /></div>
      )}

      <Modal isOpen={isDealerModalOpen} onClose={() => setIsDealerModalOpen(false)} title={selectedDealer ? 'Edit Dealer' : 'Create New Dealer'}>
        <DealerForm dealer={selectedDealer} onSave={handleSaveDealer} onCancel={() => setIsDealerModalOpen(false)} formError={formError} />
      </Modal>

      <ImportCSVModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={fetchData}
      />

      <Modal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} title="Confirm Password Reset">
        <p>Are you sure you want to reset the password for <strong>{dealerToReset?.company_name}</strong>? A new temporary password will be generated.</p>
        <div className="flex justify-end gap-4 mt-6">
            <Button variant="secondary" onClick={() => setIsResetModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleConfirmReset}>Confirm Reset</Button>
        </div>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Dealer Deletion">
        <p>Are you sure you want to delete <strong>{dealerToDelete?.company_name}</strong>?</p>
        <p className="mt-2 text-sm text-red-600">This action is irreversible. The user account and all associated employees and customers will be permanently deleted.</p>
        <div className="flex justify-end gap-4 mt-6">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleConfirmDelete}>Confirm Delete</Button>
        </div>
      </Modal>

      <Modal isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)} title="Action Successful">
          <p>{successMessage}</p>
          
          {tempPassword && (
            <div className="mt-4 p-3 bg-gray-100 rounded-md">
                <p className="text-sm text-gray-600">Temporary Password:</p>
                <div className="flex items-center justify-between">
                    <code className="text-lg font-mono text-primary">{tempPassword}</code>
                    <Button size="sm" variant="secondary" onClick={() => copyToClipboard(tempPassword)}>Copy</Button>
                </div>
            </div>
          )}

          <div className="flex justify-end mt-6">
              <Button onClick={() => setIsSuccessModalOpen(false)}>Close</Button>
          </div>
      </Modal>
    </>
  );
};

export default AdminDashboard;
