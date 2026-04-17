
export type UUID = string;

export enum UserRole {
  ADMIN = 'admin',
  DEALER = 'dealer',
}

export enum AuditActionType {
    LOGIN = 'login',
    RESET_PASSWORD = 'reset_password',
    CHANGE_PASSWORD = 'change_password',
    CREATE_DEALER = 'create_dealer',
    UPDATE_DEALER = 'update_dealer',
    DELETE_DEALER = 'delete_dealer',
    SEARCH = 'search',
    CREATE_EMPLOYEE = 'create_employee',
    UPDATE_EMPLOYEE = 'update_employee',
    TERMINATE_EMPLOYEE = 'terminate_employee',
    CREATE_CUSTOMER = 'create_customer',
    UPDATE_CUSTOMER = 'update_customer',
    UPDATE_PROFILE = 'update_profile',
    TRANSFER_REMINDER_SENT = 'transfer_reminder_sent',
    ENGAGEMENT_REMINDER_SENT = 'engagement_reminder_sent',
    IMPORT_DEALERS = 'import_dealers',
}

export interface User {
  id: UUID;
  role: UserRole;
  name: string;
  username: string;
  email: string;
  dealerId?: UUID; // Only for dealer users
  tempPass?: boolean;
}

export interface Dealer {
  id: UUID;
  user_id: UUID;
  company_name: string;
  primary_contact_name: string;
  primary_contact_phone: string;
  primary_contact_email: string;
  address: string;
  status: 'active' | 'suspended';
  created_at: string; // ISO String
}

export interface Employee {
  id: UUID;
  dealer_id: UUID;
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  aadhar: string;
  position: string;
  hire_date: string;
  status: 'active' | 'terminated';
  termination_date?: string;
  termination_reason?: string;
}

export interface Customer {
  id: UUID;
  dealer_id: UUID;
  type: 'private' | 'government';
  name_or_entity: string;
  contact_person?: string;
  phone: string;
  email?: string;
  official_id: string;
  address: string;
  status: 'active' | 'inactive';
}

export interface AuditLog {
  id: number;
  who_user_id: UUID;
  who_user_name: string;
  dealer_id?: UUID;
  action_type: AuditActionType;
  details: string;
  timestamp: string; // ISO String
}

export interface DuplicateCheckResult {
    exists: boolean;
    ownerName?: string;
    entityName?: string;
    details?: string;
}

export interface TransferLog extends AuditLog {
    company_name: string;
}

export interface DealerActivity {
    dealer_id: UUID;
    company_name: string;
    last_activity_date: string | null;
}

// New Types for Enhanced Universal Search
export interface EmploymentHistoryRecord {
  id: UUID;
  dealer_id: UUID;
  dealer_name: string;
  position: string;
  hire_date: string;
  status: 'active' | 'terminated';
  termination_date?: string;
  termination_reason?: string;
}

export interface GlobalEmployeeHistoryResult {
  first_name: string;
  last_name: string;
  aadhar: string;
  phone: string;
  history: EmploymentHistoryRecord[];
}
