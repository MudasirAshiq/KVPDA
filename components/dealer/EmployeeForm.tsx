import React, { useState, useEffect, useRef } from 'react';
import { Employee, GlobalEmployeeHistoryResult, DuplicateCheckResult } from '../../types';
import Input from '../common/Input';
import Button from '../common/Button';
import { api } from '../../services/api';
import Alert from '../common/Alert';
import { formatDate, toInputDateString } from '../../utils/helpers';


interface EmployeeFormProps {
  employee: Employee | null;
  onSave: () => void;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ employee, onSave }) => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        position: '',
        hire_date: toInputDateString(new Date()),
        aadhar: '',
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Validation States
    const [existingEmployeeInfo, setExistingEmployeeInfo] = useState<GlobalEmployeeHistoryResult | null>(null);
    const [isCheckingAadhar, setIsCheckingAadhar] = useState(false);
    
    const [duplicateWarnings, setDuplicateWarnings] = useState<{
        email: DuplicateCheckResult | null;
        phone: DuplicateCheckResult | null;
    }>({ email: null, phone: null });

    const debounceTimeout = useRef<number | null>(null);
    const isTerminated = employee?.status === 'terminated';

    useEffect(() => {
        if (employee) {
            setFormData({
                first_name: employee.first_name,
                last_name: employee.last_name,
                email: employee.email || '', // Handle optional email
                phone: employee.phone,
                position: employee.position,
                hire_date: toInputDateString(employee.hire_date),
                aadhar: employee.aadhar,
            });
        } else {
             setFormData({
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                position: '',
                hire_date: toInputDateString(new Date()),
                aadhar: '',
            });
        }
        setError('');
        setExistingEmployeeInfo(null);
        setDuplicateWarnings({ email: null, phone: null });
    }, [employee]);

    // Aadhar Check Logic
    useEffect(() => {
        if (employee) return; 

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        const aadhar = formData.aadhar.trim();
        if (aadhar.length !== 12) {
            setExistingEmployeeInfo(null);
            return;
        }

        setIsCheckingAadhar(true);
        debounceTimeout.current = window.setTimeout(async () => {
            try {
                const result = await api.searchEmployeeByAadhar(aadhar);
                setExistingEmployeeInfo(result);
            } catch (err) {
                console.error("Aadhar check failed:", err);
            } finally {
                setIsCheckingAadhar(false);
            }
        }, 500);

        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
        };
    }, [formData.aadhar, employee]);

    // Duplicate Check for Email and Phone
    useEffect(() => {
        const checkDupes = async () => {
            // Email Check
            if (formData.email) {
                const res = await api.checkEntityDuplicate('employee', 'email', formData.email, employee?.id);
                setDuplicateWarnings(prev => ({ ...prev, email: res }));
            } else {
                setDuplicateWarnings(prev => ({ ...prev, email: null }));
            }

            // Phone Check
            if (formData.phone && formData.phone.length === 10) {
                const res = await api.checkEntityDuplicate('employee', 'phone', formData.phone, employee?.id);
                setDuplicateWarnings(prev => ({ ...prev, phone: res }));
            } else {
                setDuplicateWarnings(prev => ({ ...prev, phone: null }));
            }
        };

        const timer = setTimeout(checkDupes, 500);
        return () => clearTimeout(timer);
    }, [formData.email, formData.phone, employee]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        if (name === 'phone' || name === 'aadhar') {
            const sanitizedValue = value.replace(/\D/g, '');
            const maxLength = name === 'phone' ? 10 : 12;
            setFormData(prev => ({ ...prev, [name]: sanitizedValue.slice(0, maxLength) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        const submissionData = {
            ...formData,
            email: formData.email.trim() || undefined, // Send undefined if empty
        };

        try {
            if (employee) {
                await api.updateEmployee(employee.id, submissionData);
            } else {
                // @ts-ignore
                await api.createEmployee(submissionData);
            }
            onSave();
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const activeConflict = existingEmployeeInfo?.history.some(h => h.status === 'active');
    const isBlocked = activeConflict || !!duplicateWarnings.email || !!duplicateWarnings.phone;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} required disabled={isSubmitting || isTerminated} />
                <Input label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} required disabled={isSubmitting || isTerminated} />
            </div>

            <div className="space-y-1">
                <Input label="Email (Optional)" name="email" type="email" value={formData.email} onChange={handleChange} disabled={isSubmitting || isTerminated} />
                {duplicateWarnings.email && (
                    <p className="text-xs text-amber-600 font-semibold">
                        ⚠️ Registered with: {duplicateWarnings.email.ownerName} ({duplicateWarnings.email.entityName})
                    </p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Input label="Phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required maxLength={10} disabled={isSubmitting || isTerminated} />
                    {duplicateWarnings.phone && (
                         <p className="text-xs text-amber-600 font-semibold">
                            ⚠️ Registered with: {duplicateWarnings.phone.ownerName} ({duplicateWarnings.phone.entityName})
                        </p>
                    )}
                </div>
                <Input label="Position" name="position" value={formData.position} onChange={handleChange} required disabled={isSubmitting || isTerminated} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Hire Date" name="hire_date" type="date" value={formData.hire_date} onChange={handleChange} required disabled={isSubmitting || isTerminated} />
                <div>
                    <Input label="Aadhar Number" name="aadhar" value={formData.aadhar} onChange={handleChange} required maxLength={12} disabled={isSubmitting || !!employee} />
                    {isCheckingAadhar && <p className="text-xs text-gray-500 mt-1">Checking Aadhar...</p>}
                </div>
            </div>

            {existingEmployeeInfo && (
                <div className="mt-2">
                    <Alert variant={activeConflict ? "danger" : "warning"}>
                        <div className={activeConflict ? "text-red-800" : "text-yellow-800"}>
                            <p className="font-bold">{activeConflict ? "Active Employee Found!" : "Aadhar number has a history in the network."}</p>
                            <p className="text-sm mt-1">
                                <strong>{existingEmployeeInfo.first_name} {existingEmployeeInfo.last_name}</strong> is already in the system.
                            </p>
                            {activeConflict && (
                                <p className="text-xs mt-2">
                                    This employee is currently active with another dealer. You cannot add them until they are terminated from their current position.
                                </p>
                            )}
                             {!activeConflict && (
                                <>
                                    <p className="text-xs mt-2">
                                        This employee is not currently active. You can proceed with hiring them. Their past work history is shown below for your reference.
                                    </p>
                                    <div className="mt-3 pt-3 border-t max-h-40 overflow-y-auto">
                                        <p className="text-xs font-bold mb-1">Work History:</p>
                                        <ul className="text-xs space-y-1">
                                            {existingEmployeeInfo.history.map(record => (
                                                <li key={record.id}>
                                                    <strong>{record.dealer_name}</strong> ({formatDate(record.hire_date)} - {record.termination_date ? formatDate(record.termination_date) : 'Present'})
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </>
                            )}
                        </div>
                    </Alert>
                </div>
            )}
            
            {error && <p className="text-sm text-red-600">{error}</p>}
            
            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting || isBlocked || isTerminated}>
                    {isSubmitting ? 'Saving...' : (employee ? 'Save Changes' : 'Create Employee')}
                </Button>
            </div>
        </form>
    );
};

export default EmployeeForm;