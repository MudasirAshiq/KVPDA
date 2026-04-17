
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { Employee, Customer, AuditLog } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import Table from '../common/Table';
import Badge from '../common/Badge';
import Modal from '../common/Modal';
import { formatDateTime, formatDate } from '../../utils/helpers';
import EmployeeForm from './EmployeeForm';
import CustomerForm from './CustomerForm';
import TerminationModal from './TerminationModal';
import UniversalEmployeeSearchPage from './UniversalEmployeeSearchPage';
import Alert from '../common/Alert';

const UserGroupIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.28-1.25-1.455-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.28-1.25 1.455-1.857M12 14a4 4 0 110-8 4 4 0 010 8z" />
    </svg>
);

const BuildingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
);

interface DealerDashboardProps {
  currentPage?: string;
}

const DealerDashboard: React.FC<DealerDashboardProps> = ({ currentPage = 'Dashboard' }) => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [dealerAuditLogs, setDealerAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalError, setGlobalError] = useState('');

  const [isEmployeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [isCustomerModalOpen, setCustomerModalOpen] = useState(false);
  const [isTerminationModalOpen, setTerminationModalOpen] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const fetchData = async () => {
    if (!user) return;
    setIsLoading(true);
    setGlobalError('');
    try {
        const [employeesData, customersData, logsData] = await Promise.all([
            api.getEmployees(),
            api.getCustomers(),
            api.getDealerAuditLogs()
        ]);
        setEmployees(employeesData);
        setCustomers(customersData);
        setDealerAuditLogs(logsData);
    } catch (err) {
        setGlobalError('Failed to load dashboard data. Please try again.');
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleSave = () => {
    setEmployeeModalOpen(false);
    setCustomerModalOpen(false);
    setTerminationModalOpen(false);
    fetchData();
  };
  
  const handleAddEmployee = () => { setSelectedEmployee(null); setEmployeeModalOpen(true); };
  const handleEditEmployee = (employee: Employee) => { setSelectedEmployee(employee); setEmployeeModalOpen(true); };
  const handleTerminateEmployee = (employee: Employee) => { setSelectedEmployee(employee); setTerminationModalOpen(true); };
  
  const handleAddCustomer = () => { setSelectedCustomer(null); setCustomerModalOpen(true); };
  const handleEditCustomer = (customer: Customer) => { setSelectedCustomer(customer); setCustomerModalOpen(true); };

  const activeEmployees = employees.filter(e => e.status === 'active').length;
  const privateCustomers = customers.filter(c => c.type === 'private').length;
  const governmentCustomers = customers.filter(c => c.type === 'government').length;

  const renderStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <div className="flex items-center">
          <UserGroupIcon />
          <div className="ml-4">
            <p className="text-lg font-semibold text-gray-700">{activeEmployees}</p>
            <p className="text-sm text-gray-500">Active Employees</p>
          </div>
        </div>
      </Card>
      <Card>
        <div className="flex items-center">
            <BuildingIcon />
          <div className="ml-4">
            <p className="text-lg font-semibold text-gray-700">{privateCustomers}</p>
            <p className="text-sm text-gray-500">Private Customers</p>
          </div>
        </div>
      </Card>
      <Card>
        <div className="flex items-center">
            <BuildingIcon />
          <div className="ml-4">
            <p className="text-lg font-semibold text-gray-700">{governmentCustomers}</p>
            <p className="text-sm text-gray-500">Government Customers</p>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderEmployees = () => (
    <Card title="Employees" actions={<Button onClick={handleAddEmployee} disabled={isLoading}>Add Employee</Button>}>
      {isLoading ? <div className="text-center p-4">Loading employees...</div> :
       employees.length === 0 ? <p className="text-center text-gray-500 py-4">No employees found.</p> : (
        <Table headers={['Name', 'Position', 'Hire Date', 'Status', 'Actions']}>
            {employees.map(employee => (
            <tr key={employee.id} className="text-gray-700">
                <td className="px-4 py-3">{employee.first_name} {employee.last_name}</td>
                <td className="px-4 py-3 text-sm">{employee.position}</td>
                <td className="px-4 py-3 text-sm">{formatDate(employee.hire_date)}</td>
                <td className="px-4 py-3">
                <Badge color={employee.status === 'active' ? 'green' : 'red'}>{employee.status}</Badge>
                </td>
                <td className="px-4 py-3 space-x-1">
                    <Button size="sm" variant="secondary" onClick={() => handleEditEmployee(employee)}>Edit</Button>
                    {employee.status === 'active' && <Button size="sm" variant="danger" onClick={() => handleTerminateEmployee(employee)}>Terminate</Button>}
                </td>
            </tr>
            ))}
        </Table>
       )}
    </Card>
  );

  const renderCustomers = () => (
    <Card title="Customers" actions={<Button onClick={handleAddCustomer} disabled={isLoading}>Add Customer</Button>}>
        {isLoading ? <div className="text-center p-4">Loading customers...</div> :
        customers.length === 0 ? <p className="text-center text-gray-500 py-4">No customers found.</p> : (
            <Table headers={['Name/Entity', 'Type', 'Status', 'Actions']}>
                {customers.map(customer => (
                <tr key={customer.id} className="text-gray-700">
                    <td className="px-4 py-3">{customer.name_or_entity}</td>
                    <td className="px-4 py-3 text-sm capitalize">{customer.type}</td>
                    <td className="px-4 py-3">
                    <Badge color={customer.status === 'active' ? 'green' : 'gray'}>{customer.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                        <Button size="sm" variant="secondary" onClick={() => handleEditCustomer(customer)}>Edit</Button>
                    </td>
                </tr>
                ))}
            </Table>
        )}
    </Card>
  );
  
  const renderActivityTimeline = () => (
      <Card title="Activity Timeline">
        {isLoading ? <div className="text-center p-4">Loading activity...</div> :
        dealerAuditLogs.length === 0 ? <p className="text-center text-gray-500 py-4">No recent activity found.</p> : (
            <Table headers={["Timestamp", "User", "Action", "Details"]}>
            {dealerAuditLogs.slice(0, 5).map(log => (
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
  )

  return (
    <>
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">
         {currentPage === 'Dashboard' ? 'Dealer Dashboard' : currentPage}
      </h1>

      {globalError && <div className="mb-4"><Alert message={globalError} variant="danger" onClose={() => setGlobalError('')} /></div>}
      
      {currentPage === 'Dashboard' && (
        <>
          {isLoading ? <div className="text-center p-8 text-gray-500">Loading Dashboard Data...</div> : (
              <>
                {renderStats()}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {renderEmployees()}
                    {renderCustomers()}
                </div>
                <div className="mt-8">{renderActivityTimeline()}</div>
              </>
          )}
        </>
      )}

      {currentPage === 'Employees' && renderEmployees()}
      {currentPage === 'Customers' && renderCustomers()}
      {currentPage === 'Universal Search' && <UniversalEmployeeSearchPage />}


      <Modal isOpen={isEmployeeModalOpen} onClose={() => setEmployeeModalOpen(false)} title={selectedEmployee ? 'Edit Employee' : 'Add Employee'}>
        <EmployeeForm employee={selectedEmployee} onSave={handleSave} />
      </Modal>

      <Modal isOpen={isCustomerModalOpen} onClose={() => setCustomerModalOpen(false)} title={selectedCustomer ? 'Edit Customer' : 'Add Customer'}>
        <CustomerForm customer={selectedCustomer} onSave={handleSave} />
      </Modal>

      <TerminationModal
        isOpen={isTerminationModalOpen}
        onClose={() => setTerminationModalOpen(false)}
        employee={selectedEmployee}
        onSave={handleSave}
      />
    </>
  );
};

export default DealerDashboard;
