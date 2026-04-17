
import React, { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { useAuth } from '../../hooks/useAuth';

const ChangePasswordModal: React.FC = () => {
    const { needsPasswordChange, updatePassword } = useAuth();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // If the user does not need to change their password, do not render the modal.
    if (!needsPasswordChange) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            await updatePassword(newPassword);
            // The modal will close automatically because needsPasswordChange will become false
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={true}
            onClose={() => {}}
            title="Change Password Required"
            hideCloseButton={true}
            disableBackdropClick={true}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                You are logged in with a temporary password. For security reasons, you must set a new secure password to continue.
                            </p>
                        </div>
                    </div>
                </div>

                <Input
                    label="New Password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="Min. 6 characters"
                />
                <Input
                    label="Confirm New Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="Re-enter password"
                />

                {error && <p className="text-sm text-red-600">{error}</p>}

                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={loading || !newPassword || !confirmPassword}>
                        {loading ? 'Updating...' : 'Set New Password'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default ChangePasswordModal;
