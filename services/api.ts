import { 
    Dealer, 
    Employee, 
    Customer, 
    AuditLog, 
    GlobalEmployeeHistoryResult, 
    UUID, 
    User,
    UserRole,
    AuditActionType,
    DuplicateCheckResult,
    DealerActivity,
    TransferLog
} from '../types';
import { sql, sqlSingle } from './neon';

export const dbMode = 'neon';

console.log(`[App] Database Mode: ${dbMode.toUpperCase()}`);

// --- API Implementation (Neon SQL) ---

export const api = {
  // === AUTH ===
  adminLogin: async (password: string): Promise<User> => {
    // Security Note: In a real app, hash passwords! For this demo, we check plain text match 
    // against the 'users' table where role='admin'.
    try {
        const user = await sqlSingle(
            `SELECT * FROM users WHERE role = 'admin' AND password = $1 LIMIT 1`,
            [password]
        );

        if (!user) throw new Error('Invalid Admin Password');
        
        // Log Action
        await api.logAction(user.id, user.name, null, AuditActionType.LOGIN, 'Admin logged in');

        return {
            id: user.id,
            role: UserRole.ADMIN,
            name: user.name,
            username: user.username,
            email: user.email,
            tempPass: false
        };
    } catch (err: any) {
        // Postgres error code 42P01 means "relation does not exist" (table missing)
        if (err.code === '42P01' || err.message?.includes('relation "users" does not exist')) {
           throw new Error('Database tables not found. Please run the SQL Schema script in your Neon Console.');
        }
        throw err;
    }
  },

  dealerLogin: async (email: string, password: string): Promise<User> => {
    // Join users with dealers to get dealer status and info
    try {
        const user = await sqlSingle(
            `SELECT u.*, d.id as dealer_uuid, d.status as dealer_status 
             FROM users u 
             LEFT JOIN dealers d ON u.dealer_id = d.id 
             WHERE u.email = $1 AND u.password = $2 LIMIT 1`,
            [email, password]
        );

        if (!user) throw new Error('Invalid Email or Password');
        if (user.role === 'dealer' && user.dealer_status !== 'active') {
            throw new Error('This dealer account is not active.');
        }

        await api.logAction(user.id, user.name, user.dealer_uuid, AuditActionType.LOGIN, 'Dealer logged in');

        return {
            id: user.id,
            role: user.role as UserRole,
            name: user.name,
            username: user.username,
            email: user.email,
            dealerId: user.dealer_uuid,
            tempPass: user.is_temp_password
        };
    } catch (err: any) {
        if (err.code === '42P01' || err.message?.includes('relation "users" does not exist')) {
           throw new Error('Database tables not found. Please run the SQL Schema script in your Neon Console.');
        }
        throw err;
    }
  },
  
  logout: async (): Promise<void> => {
      // Stateless JWT or Client-side only for this demo
      return Promise.resolve();
  },

  changePassword: async(userId: UUID, newPass: string): Promise<User> => {
    // Update password and clear temp flag
    const updatedUser = await sqlSingle(
        `UPDATE users 
         SET password = $1, is_temp_password = false 
         WHERE id = $2 
         RETURNING *`,
        [newPass, userId]
    );
    
    if (!updatedUser) throw new Error("User not found");
    
    // Re-fetch to ensure consistent shape
    return {
        id: updatedUser.id,
        role: updatedUser.role as UserRole,
        name: updatedUser.name,
        username: updatedUser.username,
        email: updatedUser.email,
        dealerId: updatedUser.dealer_id,
        tempPass: false
    };
  },
  
  updateUserProfile: async (userId: UUID, data: { name: string; username: string }): Promise<User> => {
      const updated = await sqlSingle(
          `UPDATE users SET name = $1, username = $2 WHERE id = $3 RETURNING *`,
          [data.name, data.username, userId]
      );
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      return { ...currentUser, ...data };
  },

  // === AUDIT LOGGING INTERNAL HELPER ===
  logAction: async (userId: UUID, userName: string, dealerId: UUID | null | undefined, action: AuditActionType, details: string) => {
    try {
        await sql(
            `INSERT INTO audit_logs (who_user_id, who_user_name, dealer_id, action_type, details) 
             VALUES ($1, $2, $3, $4, $5)`,
            [userId, userName, dealerId || null, action, details]
        );
    } catch (e) {
        console.error("Failed to write audit log", e);
    }
  },

  // === AVAILABILITY CHECKS (For Dealer Registration) ===
  checkAvailability: async (type: 'username' | 'email' | 'phone', value: string): Promise<boolean> => {
    if (!value) return true;
    try {
        if (type === 'username') {
            const res = await sqlSingle(`SELECT 1 FROM users WHERE username = $1 LIMIT 1`, [value]);
            return !res; // Return true if available (not found)
        }
        if (type === 'email') {
            const res = await sqlSingle(`SELECT 1 FROM users WHERE email = $1 LIMIT 1`, [value]);
            return !res;
        }
        if (type === 'phone') {
            const res = await sqlSingle(`SELECT 1 FROM dealers WHERE primary_contact_phone = $1 LIMIT 1`, [value]);
            return !res;
        }
    } catch (e) {
        console.error("Availability check failed", e);
        return true; 
    }
    return true;
  },

  // === ENTITY DUPLICATE CHECKS (For Employee/Customer Forms) ===
  checkEntityDuplicate: async (
      entityType: 'employee' | 'customer', 
      field: 'email' | 'phone' | 'official_id', 
      value: string, 
      excludeId?: string
  ): Promise<DuplicateCheckResult | null> => {
      if (!value) return null;
      
      try {
          if (entityType === 'employee') {
             // Query employees joined with dealers to get owner name
             let query = `
                SELECT e.first_name, e.last_name, d.company_name 
                FROM employees e 
                JOIN dealers d ON e.dealer_id = d.id 
                WHERE e.${field} = $1 AND e.status = 'active'
             `;
             const params: any[] = [value];

             if (excludeId) {
                 query += ` AND e.id != $2`;
                 params.push(excludeId);
             }
             query += ` LIMIT 1`;

             const res = await sqlSingle(query, params);
             
             if (res) {
                 return {
                     exists: true,
                     ownerName: res.company_name,
                     entityName: `${res.first_name} ${res.last_name}`
                 };
             }
          } 
          else if (entityType === 'customer') {
             let query = `
                SELECT c.name_or_entity, c.type, d.company_name 
                FROM customers c 
                JOIN dealers d ON c.dealer_id = d.id 
                WHERE c.${field} = $1 AND c.status = 'active'
             `;
             const params: any[] = [value];
             
             if (excludeId) {
                 query += ` AND c.id != $2`;
                 params.push(excludeId);
             }
             query += ` LIMIT 1`;

             const res = await sqlSingle(query, params);
             
             if (res) {
                 // capitalize type
                 const typeFormatted = res.type.charAt(0).toUpperCase() + res.type.slice(1);
                 return {
                     exists: true,
                     ownerName: res.company_name,
                     entityName: `${res.name_or_entity} (${typeFormatted})`
                 };
             }
          }
      } catch (e) {
          console.error("Duplicate check failed", e);
      }
      return null;
  },

  // --- VALIDATION HELPERS ---
  validateEmployeeUniqueness: async (data: { email?: string, phone: string, aadhar: string }, excludeId?: UUID) => {
      // Check Phone
      let query = `SELECT d.company_name FROM employees e JOIN dealers d ON e.dealer_id = d.id WHERE e.phone = $1 AND e.status = 'active'`;
      const params: any[] = [data.phone];
      if (excludeId) { query += ` AND e.id != $2`; params.push(excludeId); }
      const phoneExists = await sqlSingle(query, params);
      if (phoneExists) throw new Error(`Phone number is already registered with ${phoneExists.company_name}.`);

      // Check Aadhar
      query = `SELECT d.company_name FROM employees e JOIN dealers d ON e.dealer_id = d.id WHERE e.aadhar = $1 AND e.status = 'active'`;
      const aadharParams: any[] = [data.aadhar];
      if (excludeId) { query += ` AND e.id != $2`; aadharParams.push(excludeId); }
      const aadharExists = await sqlSingle(query, aadharParams);
      if (aadharExists) throw new Error(`Aadhar is already registered with ${aadharExists.company_name}.`);

      // Check Email (if provided)
      if (data.email) {
          query = `SELECT d.company_name FROM employees e JOIN dealers d ON e.dealer_id = d.id WHERE e.email = $1 AND e.status = 'active'`;
          const emailParams: any[] = [data.email];
          if (excludeId) { query += ` AND e.id != $2`; emailParams.push(excludeId); }
          const emailExists = await sqlSingle(query, emailParams);
          if (emailExists) throw new Error(`Email is already registered with ${emailExists.company_name}.`);
      }
  },

  validateCustomerUniqueness: async (data: { phone: string, official_id: string, email?: string }, excludeId?: UUID) => {
      // Check Phone
      let query = `SELECT d.company_name FROM customers c JOIN dealers d ON c.dealer_id = d.id WHERE c.phone = $1 AND c.status = 'active'`;
      const params: any[] = [data.phone];
      if (excludeId) { query += ` AND c.id != $2`; params.push(excludeId); }
      const phoneExists = await sqlSingle(query, params);
      if (phoneExists) throw new Error(`Phone number is already registered with ${phoneExists.company_name}.`);

      // Check Official ID
      query = `SELECT d.company_name FROM customers c JOIN dealers d ON c.dealer_id = d.id WHERE c.official_id = $1 AND c.status = 'active'`;
      const idParams: any[] = [data.official_id];
      if (excludeId) { query += ` AND c.id != $2`; idParams.push(excludeId); }
      const idExists = await sqlSingle(query, idParams);
      if (idExists) throw new Error(`Official ID is already registered with ${idExists.company_name}.`);

      // Check Email
      if (data.email) {
        query = `SELECT d.company_name FROM customers c JOIN dealers d ON c.dealer_id = d.id WHERE c.email = $1 AND c.status = 'active'`;
        const emailParams: any[] = [data.email];
        if (excludeId) { query += ` AND c.id != $2`; emailParams.push(excludeId); }
        const emailExists = await sqlSingle(query, emailParams);
        if (emailExists) throw new Error(`Email is already registered with ${emailExists.company_name}.`);
      }
  },

  // === ADMIN ===
  getDealers: async (): Promise<Dealer[]> => {
      const rows = await sql(`SELECT * FROM dealers ORDER BY created_at DESC`);
      return rows as Dealer[];
  },

  getAuditLogs: async (): Promise<AuditLog[]> => {
      const rows = await sql(`SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100`);
      return rows as AuditLog[];
  },
  
  createDealer: async (formData: Omit<Dealer, 'id' | 'status' | 'created_at' | 'user_id'> & { username: string }): Promise<{dealer: Dealer, tempPass: string}> => {
      
      // Check for duplicate username or email
      const existingUser = await sqlSingle(
          `SELECT username, email FROM users WHERE username = $1 OR email = $2 LIMIT 1`,
          [formData.username, formData.primary_contact_email]
      );

      if (existingUser) {
          if (existingUser.username === formData.username) {
              throw new Error("Username is already taken. Please choose another.");
          }
          throw new Error("Email address is already registered to another user.");
      }

      // Check for duplicate phone
      const existingPhone = await sqlSingle(
          `SELECT 1 FROM dealers WHERE primary_contact_phone = $1 LIMIT 1`,
          [formData.primary_contact_phone]
      );
      if (existingPhone) {
          throw new Error("Phone number is already registered to another dealer.");
      }

      const tempPass = Math.random().toString(36).slice(-8);
      
      // 1. Create Dealer
      const dealer = await sqlSingle(
          `INSERT INTO dealers (company_name, primary_contact_name, primary_contact_email, primary_contact_phone, address, status)
           VALUES ($1, $2, $3, $4, $5, 'active')
           RETURNING *`,
          [formData.company_name, formData.primary_contact_name, formData.primary_contact_email, formData.primary_contact_phone, formData.address]
      );

      // 2. Create User for Dealer
      const user = await sqlSingle(
          `INSERT INTO users (dealer_id, role, name, username, email, password, is_temp_password)
           VALUES ($1, 'dealer', $2, $3, $4, $5, true)
           RETURNING id`,
          [dealer.id, formData.company_name, formData.username, formData.primary_contact_email, tempPass]
      );

      // 3. Link User ID back to Dealer (for reference)
      await sql(`UPDATE dealers SET user_id = $1 WHERE id = $2`, [user.id, dealer.id]);

      // Audit
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (currentUser.id) {
          await api.logAction(currentUser.id, currentUser.name, null, AuditActionType.CREATE_DEALER, `Created dealer ${dealer.company_name}`);
      }

      return { dealer: { ...dealer, user_id: user.id }, tempPass };
  },

  importDealersFromCSV: async (data: any[]): Promise<{success: number, fails: number, errors: string[]}> => {
    let success = 0;
    let fails = 0;
    const errors: string[] = [];

    for (const row of data) {
        try {
            if (!row.company_name || !row.username || !row.primary_contact_email || !row.primary_contact_phone) {
                throw new Error(`Missing required fields for row with company: ${row.company_name || 'N/A'}`);
            }
            await api.createDealer(row);
            success++;
        } catch (err) {
            fails++;
            errors.push((err as Error).message);
        }
    }
    
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (currentUser.id) {
        await api.logAction(currentUser.id, currentUser.name, null, AuditActionType.IMPORT_DEALERS, `Bulk imported dealers. Success: ${success}, Fails: ${fails}.`);
    }

    return { success, fails, errors };
  },
  
  updateDealer: async (dealerId: UUID, data: Partial<Omit<Dealer, 'id' | 'user_id'>>): Promise<Dealer> => {
      const updates: string[] = [];
      const values: any[] = [];
      let i = 1;

      Object.keys(data).forEach(key => {
          // @ts-ignore
          updates.push(`${key} = $${i}`);
          // @ts-ignore
          values.push(data[key]);
          i++;
      });
      values.push(dealerId);

      const updated = await sqlSingle(
          `UPDATE dealers SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`,
          values
      );
      return updated as Dealer;
  },

  deleteDealer: async (dealerId: UUID): Promise<void> => {
      await sql(`DELETE FROM dealers WHERE id = $1`, [dealerId]);
      // Also delete the user associated
      await sql(`DELETE FROM users WHERE dealer_id = $1`, [dealerId]);
  },

  resetDealerPassword: async (userId: UUID): Promise<string> => {
    const newPass = Math.random().toString(36).slice(-8);
    await sql(
        `UPDATE users SET password = $1, is_temp_password = true WHERE id = $2`,
        [newPass, userId]
    );
    
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (currentUser.id) {
        await api.logAction(currentUser.id, currentUser.name, null, AuditActionType.RESET_PASSWORD, `Reset password for user ${userId}`);
    }

    return newPass;
  },

  // Helper for sending emails via Mailgun
  sendMailgunEmail: async (to: string, subject: string, text: string): Promise<boolean> => {
      const env = (import.meta as any).env || {};
      const apiKey = env.VITE_MAILGUN_API_KEY;
      const domain = env.VITE_MAILGUN_DOMAIN;

      if (!apiKey || !domain || apiKey === 'YOUR_MAILGUN_API_KEY' || !domain.includes('.')) {
          console.warn("Mailgun configuration missing or incomplete. Email sending will be skipped.");
          return false; 
      }

      const formData = new FormData();
      formData.append('from', `KVPDA <noreply@${domain}>`);
      formData.append('to', to);
      formData.append('subject', subject);
      formData.append('text', text);
      
      try {
        const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + btoa('api:' + apiKey)
            },
            body: formData
        });

        if (!response.ok) {
            const errData = await response.json();
            console.error("Mailgun Error:", errData);
            return false;
        }
        return true;
      } catch (err) {
        console.error("Network error trying to send Mailgun email:", err);
        return false;
      }
  },

  resetDealerPasswordByEmail: async (email: string): Promise<{ success: boolean, tempPass?: string }> => {
     // 1. Find User
     const user = await sqlSingle(`SELECT id, name FROM users WHERE email = $1 AND role = 'dealer'`, [email]);
     if (!user) throw new Error("No dealer account found with that email address.");

     // 2. Generate Temporary Password
     const tempPass = Math.random().toString(36).slice(-8);

     // 3. Update Database
     await sql(
        `UPDATE users SET password = $1, is_temp_password = true WHERE id = $2`,
        [tempPass, user.id]
     );

     // 4. Send Email via Mailgun
     const emailBody = `
Hello ${user.name},

A password reset was requested for your KVPDA account.

Your new temporary password is: ${tempPass}

Please login and change your password immediately.

Regards,
KVPDA Team
     `;

     const emailSent = await api.sendMailgunEmail(email, "Password Reset Request", emailBody);
     
     if (!emailSent) {
         return { success: false, tempPass };
     }
     
     return { success: true };
  },
  
  getTransferLogs: async (): Promise<TransferLog[]> => {
    const rows = await sql(
        `SELECT a.*, d.company_name 
         FROM audit_logs a
         JOIN dealers d ON a.dealer_id = d.id
         WHERE a.action_type IN ('create_employee', 'terminate_employee')
         ORDER BY a.timestamp ASC`
    );
    return rows as TransferLog[];
  },

  sendTransferReminderEmail: async (logId: number): Promise<void> => {
    const log = await sqlSingle(
        `SELECT a.details, a.dealer_id, d.company_name, d.primary_contact_email 
         FROM audit_logs a
         JOIN dealers d ON a.dealer_id = d.id
         WHERE a.id = $1`,
        [logId]
    );

    if (!log) throw new Error("Activity log not found.");
    if (!log.dealer_id) throw new Error("Log is not associated with a dealer.");

    const { company_name, primary_contact_email, details, dealer_id } = log;

    const subject = "Reminder: Employee Registry Update";
    const emailBody = `
Dear ${company_name},

This is a reminder regarding a recent activity on your account:

Activity Details: "${details}"

Please ensure all related documentation and internal records are updated accordingly.

Thank you for your cooperation in keeping the KVPDA up-to-date.

Regards,
KVPDA Administration
    `;
    
    await api.sendMailgunEmail(primary_contact_email, subject, emailBody);

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (currentUser.id) {
        await api.logAction(currentUser.id, currentUser.name, dealer_id, AuditActionType.TRANSFER_REMINDER_SENT, `Sent transfer reminder to ${company_name} for log ID ${logId}`);
    }
  },
  
  getDealerActivity: async (): Promise<DealerActivity[]> => {
    const dealers = await sql(`SELECT id, company_name FROM dealers ORDER BY company_name ASC`);
    const lastActivities = await sql(
        `SELECT dealer_id, MAX(timestamp) as last_activity_date
         FROM audit_logs
         WHERE action_type IN ('create_employee', 'terminate_employee', 'create_customer', 'update_customer')
         GROUP BY dealer_id`
    );

    const activityMap = new Map(lastActivities.map(a => [a.dealer_id, a.last_activity_date]));

    return dealers.map(d => ({
        dealer_id: d.id,
        company_name: d.company_name,
        last_activity_date: activityMap.get(d.id) || null,
    }));
  },

  sendEngagementReminderEmail: async (dealerId: UUID, companyName: string): Promise<void> => {
    const dealerInfo = await sqlSingle(`SELECT primary_contact_email FROM dealers WHERE id = $1`, [dealerId]);
    if (!dealerInfo) throw new Error("Dealer not found.");

    const subject = "A Friendly Reminder from KVPDA";
    const emailBody = `
Dear ${companyName},

This is a friendly reminder to please log in to the KVPDA portal to ensure your employee and customer records are up to date. 
Keeping the registry current is vital for the benefit of all members.

Thank you for your cooperation.

Regards,
KVPDA Administration
    `;

    await api.sendMailgunEmail(dealerInfo.primary_contact_email, subject, emailBody);

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (currentUser.id) {
        await api.logAction(currentUser.id, currentUser.name, dealerId, AuditActionType.ENGAGEMENT_REMINDER_SENT, `Sent engagement reminder to ${companyName}`);
    }
  },
  
  // === DEALER ===
  getEmployees: async (): Promise<Employee[]> => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (!currentUser.dealerId) return [];
    
    return await sql(`SELECT * FROM employees WHERE dealer_id = $1 ORDER BY created_at DESC`, [currentUser.dealerId]) as Employee[];
  },
  
  createEmployee: async (employeeData: Omit<Employee, 'id' | 'dealer_id' | 'status'>): Promise<Employee> => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (!currentUser.dealerId) throw new Error("No dealer session");

    // Strict Backend Validation
    await api.validateEmployeeUniqueness({
        phone: employeeData.phone,
        aadhar: employeeData.aadhar,
        email: employeeData.email
    });

    const newEmp = await sqlSingle(
        `INSERT INTO employees (dealer_id, first_name, last_name, email, phone, aadhar, position, hire_date, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active')
         RETURNING *`,
        [currentUser.dealerId, employeeData.first_name, employeeData.last_name, employeeData.email, employeeData.phone, employeeData.aadhar, employeeData.position, employeeData.hire_date]
    );

    await api.logAction(currentUser.id, currentUser.name, currentUser.dealerId, AuditActionType.CREATE_EMPLOYEE, `Created employee ${newEmp.first_name} ${newEmp.last_name}`);

    return newEmp as Employee;
  },

  updateEmployee: async (employeeId: UUID, data: Partial<Employee>): Promise<Employee> => {
    // If any unique fields are being updated, we must validate.
    if (data.phone !== undefined || data.aadhar !== undefined || data.email !== undefined) {
        const currentEmployee = await sqlSingle(`SELECT phone, aadhar, email FROM employees WHERE id = $1`, [employeeId]);
        if (!currentEmployee) throw new Error("Employee not found for validation.");

        // Create a merged object for validation, prioritizing the new data.
        const mergedData = {
            phone: data.phone !== undefined ? data.phone : currentEmployee.phone,
            aadhar: data.aadhar !== undefined ? data.aadhar : currentEmployee.aadhar,
            email: data.email !== undefined ? data.email : currentEmployee.email,
        };
        await api.validateEmployeeUniqueness(mergedData, employeeId);
    }

    const updates: string[] = [];
    const values: any[] = [];
    let i = 1;

    Object.keys(data).forEach(key => {
        // @ts-ignore
        if (data[key] !== undefined) {
            updates.push(`${key} = $${i}`);
            // @ts-ignore
            values.push(data[key]);
            i++;
        }
    });
    values.push(employeeId);

    if (updates.length === 0) { // No actual changes
        return sqlSingle(`SELECT * FROM employees WHERE id = $1`, [employeeId]) as Promise<Employee>;
    }

    const updated = await sqlSingle(
        `UPDATE employees SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`,
        values
    );
    return updated as Employee;
  },
  
  terminateEmployee: async (employeeId: UUID, reason: string, date: string): Promise<Employee> => {
    const updated = await sqlSingle(
        `UPDATE employees 
         SET status = 'terminated', termination_reason = $1, termination_date = $2
         WHERE id = $3
         RETURNING *`,
        [reason, date, employeeId]
    );

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (currentUser.id) {
        await api.logAction(currentUser.id, currentUser.name, currentUser.dealerId, AuditActionType.TERMINATE_EMPLOYEE, `Terminated employee ${updated.first_name} ${updated.last_name}`);
    }

    return updated as Employee;
  },

  getCustomers: async (): Promise<Customer[]> => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (!currentUser.dealerId) return [];
    return await sql(`SELECT * FROM customers WHERE dealer_id = $1 ORDER BY created_at DESC`, [currentUser.dealerId]) as Customer[];
  },
  
  createCustomer: async (customerData: Omit<Customer, 'id' | 'dealer_id' | 'status'>): Promise<Customer> => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (!currentUser.dealerId) throw new Error("No dealer session");

    // Strict Backend Validation
    await api.validateCustomerUniqueness({
        phone: customerData.phone,
        official_id: customerData.official_id,
        email: customerData.email
    });

    const newCust = await sqlSingle(
        `INSERT INTO customers (dealer_id, type, name_or_entity, contact_person, phone, email, official_id, address, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active')
         RETURNING *`,
        [currentUser.dealerId, customerData.type, customerData.name_or_entity, customerData.contact_person, customerData.phone, customerData.email, customerData.official_id, customerData.address]
    );
    
    return newCust as Customer;
  },
  
  updateCustomer: async (customerId: UUID, data: Partial<Customer>): Promise<Customer> => {
     // If any unique fields are being updated, we must validate.
    if (data.phone !== undefined || data.official_id !== undefined || data.email !== undefined) {
        const currentCustomer = await sqlSingle(`SELECT phone, official_id, email FROM customers WHERE id = $1`, [customerId]);
        if (!currentCustomer) throw new Error("Customer not found for validation.");

        // Create a merged object for validation, prioritizing the new data.
        const mergedData = {
            phone: data.phone !== undefined ? data.phone : currentCustomer.phone,
            official_id: data.official_id !== undefined ? data.official_id : currentCustomer.official_id,
            email: data.email !== undefined ? data.email : currentCustomer.email,
        };
        await api.validateCustomerUniqueness(mergedData, customerId);
    }

    const updates: string[] = [];
    const values: any[] = [];
    let i = 1;

    Object.keys(data).forEach(key => {
        // @ts-ignore
        if (data[key] !== undefined) {
            updates.push(`${key} = $${i}`);
            // @ts-ignore
            values.push(data[key]);
            i++;
        }
    });
    values.push(customerId);

    if (updates.length === 0) {
        return sqlSingle(`SELECT * FROM customers WHERE id = $1`, [customerId]) as Promise<Customer>;
    }

    const updated = await sqlSingle(
        `UPDATE customers SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`,
        values
    );
    return updated as Customer;
  },
  
  getDealerAuditLogs: async (): Promise<AuditLog[]> => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (!currentUser.dealerId) return [];
    return await sql(`SELECT * FROM audit_logs WHERE dealer_id = $1 ORDER BY timestamp DESC LIMIT 100`, [currentUser.dealerId]) as AuditLog[];
  },

  // === UNIVERSAL ===
  searchEmployeeByAadhar: async (aadhar: string): Promise<GlobalEmployeeHistoryResult | null> => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (currentUser.id) {
        await api.logAction(currentUser.id, currentUser.name, currentUser.dealerId, AuditActionType.SEARCH, `Searched for Aadhar: ${aadhar}`);
    }

    if (aadhar.length !== 12 || !/^\d{12}$/.test(aadhar)) {
        return null; 
    }
    
    // Fetch all employment records for this aadhar
    const historyRows = await sql(
        `SELECT e.*, d.company_name as dealer_name
         FROM employees e
         JOIN dealers d ON e.dealer_id = d.id
         WHERE e.aadhar = $1
         ORDER BY e.hire_date ASC`,
        [aadhar]
    );

    if (historyRows.length === 0) return null;

    // The core details should be consistent across all records
    const firstRecord = historyRows[0];

    return {
        first_name: firstRecord.first_name,
        last_name: firstRecord.last_name,
        aadhar: firstRecord.aadhar,
        phone: firstRecord.phone, // Assuming phone is consistent, might need refinement
        history: historyRows.map(row => ({
            id: row.id,
            dealer_id: row.dealer_id,
            dealer_name: row.dealer_name,
            position: row.position,
            hire_date: row.hire_date,
            status: row.status,
            termination_date: row.termination_date,
            termination_reason: row.termination_reason,
        })),
    };
  },
};