import { User, Dealer, Employee, Customer, AuditLog, UserRole, AuditActionType } from '../types';

export const nextIds = {
    user: 10,
    dealer: 10,
    employee: 100,
    customer: 100,
    audit: 100,
};

// Passwords are plain text for this mock setup.
export const users: any[] = [
    {
        id: 'user-1',
        role: UserRole.ADMIN,
        name: 'Admin User',
        username: 'admin',
        email: 'admin@union.org',
        password: 'Union@2025',
        tempPass: false,
    },
    {
        id: 'user-2',
        role: UserRole.DEALER,
        dealerId: 'dealer-1',
        name: 'John Doe',
        username: 'johndealer',
        email: 'john@kashmirfuels.com',
        password: 'password123',
        tempPass: false,
    },
    {
        id: 'user-3',
        role: UserRole.DEALER,
        dealerId: 'dealer-2',
        name: 'Jane Smith',
        username: 'janesmith',
        email: 'jane@himalayanpetro.com',
        password: 'password123',
        tempPass: false,
    },
];

export const dealers: Dealer[] = [
    {
        id: 'dealer-1',
        user_id: 'user-2',
        company_name: 'Kashmir Fuels',
        primary_contact_name: 'John Doe',
        primary_contact_phone: '9876543210',
        primary_contact_email: 'john@kashmirfuels.com',
        address: '123 Lal Chowk, Srinagar',
        status: 'active',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    },
    {
        id: 'dealer-2',
        user_id: 'user-3',
        company_name: 'Himalayan Petro',
        primary_contact_name: 'Jane Smith',
        primary_contact_phone: '8765432109',
        primary_contact_email: 'jane@himalayanpetro.com',
        address: '456 Residency Road, Jammu',
        status: 'active',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    }
];

export const employees: Employee[] = [
    {
        id: 'emp-1',
        dealer_id: 'dealer-1',
        first_name: 'Amit',
        last_name: 'Sharma',
        phone: '9988776655',
        email: 'amit.sharma@email.com',
        aadhar: '123456789012',
        position: 'Manager',
        hire_date: '2022-01-15',
        status: 'active',
    },
    {
        id: 'emp-2',
        dealer_id: 'dealer-1',
        first_name: 'Sunita',
        last_name: 'Verma',
        phone: '8877665544',
        email: 'sunita.verma@email.com',
        aadhar: '234567890123',
        position: 'Cashier',
        hire_date: '2023-03-20',
        status: 'active',
    },
    {
        id: 'emp-3',
        dealer_id: 'dealer-2',
        first_name: 'Ravi',
        last_name: 'Kumar',
        phone: '7766554433',
        email: 'ravi.kumar@email.com',
        aadhar: '345678901234',
        position: 'Forecourt Attendant',
        hire_date: '2021-11-01',
        status: 'active',
    },
    {
        id: 'emp-4',
        dealer_id: 'dealer-2',
        first_name: 'Priya',
        last_name: 'Singh',
        phone: '6655443322',
        email: 'priya.singh@email.com',
        aadhar: '456789012345',
        position: 'Manager',
        hire_date: '2020-05-10',
        status: 'terminated',
        termination_date: '2024-04-01',
        termination_reason: 'Resigned for a better opportunity.',
    },
];

export const customers: Customer[] = [
    {
        id: 'cust-1',
        dealer_id: 'dealer-1',
        type: 'private',
        name_or_entity: 'Kashmir Transport Co.',
        phone: '1122334455',
        email: 'contact@ktransport.com',
        official_id: 'DL12345',
        address: 'Transport Yard, Srinagar',
        status: 'active',
    },
    {
        id: 'cust-2',
        dealer_id: 'dealer-2',
        type: 'government',
        name_or_entity: 'Srinagar Municipal Corporation',
        contact_person: 'Mr. Gupta',
        phone: '2233445566',
        email: 'procurement@smc.gov.in',
        official_id: 'SMC-TAX-ID-987',
        address: 'Town Hall, Srinagar',
        status: 'active',
    },
];

export const auditLogs: AuditLog[] = [
    {
        id: 1,
        who_user_id: 'user-1',
        who_user_name: 'Admin User',
        action_type: AuditActionType.LOGIN,
        details: 'Admin logged in.',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    },
    {
        id: 2,
        who_user_id: 'user-2',
        who_user_name: 'John Doe',
        dealer_id: 'dealer-1',
        action_type: AuditActionType.CREATE_EMPLOYEE,
        details: 'Created employee: Amit Sharma',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    },
];