
import React, { useState, useEffect } from 'react';
import { Employee } from '../../types';
import { api } from '../../services/api';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import { toInputDateString } from '../../utils/helpers';

interface TerminationModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onSave: () => void;
}

const TerminationModal: React.FC<TerminationModalProps> = ({ isOpen, onClose, employee, onSave }) => {
    const [reason, setReason] = useState('');
    const [date, setDate] = useState(toInputDateString(new Date()));
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setReason('');
            setError('');
            setDate(toInputDateString(new Date()));
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        setError('');
        if (!employee || !reason.trim() || !date) {
            setError('Termination date and reason are required.');
            return;
        }

        // --- THE FIX ---
        // Compare dates in a timezone-safe manner by converting both to 'YYYY-MM-DD' strings.
        const hireDatePart = toInputDateString(employee.hire_date);
        const terminationDatePart = date;

        if (terminationDatePart < hireDatePart) {
            setError('Termination date cannot be earlier than the hire date.');
            return;
        }

        setIsSubmitting(true);
        try {
            await api.terminateEmployee(employee.id, reason, date);
            onSave();
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!employee) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Terminate ${employee.first_name} ${employee.last_name}`}>
            <div className="space-y-4">
                <p>Please provide the termination date and reason. This information will be visible in universal search results across the network.</p>
                <Input
                    label="Termination Date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    disabled={isSubmitting}
                />
                <Input
                    label="Termination Reason"
                    textarea
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="A reason is required and will be logged permanently."
                    disabled={isSubmitting}
                />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="flex justify-end gap-4 pt-4">
                    <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                    <Button variant="danger" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Terminating...' : 'Confirm Termination'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default TerminationModal;
