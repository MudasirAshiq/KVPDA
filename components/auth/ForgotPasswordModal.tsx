import React, { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { api } from '../../services/api';
import { copyToClipboard } from '../../utils/helpers';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fallbackPassword, setFallbackPassword] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFallbackPassword(null);
    try {
      const result = await api.resetDealerPasswordByEmail(email);
      if (!result.success && result.tempPass) {
        setFallbackPassword(result.tempPass);
      }
      setSubmitted(true);
    } catch (err) {
      setError((err as Error).message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setSubmitted(false);
    setError('');
    setLoading(false);
    setFallbackPassword(null);
    onClose();
  }

  const renderSuccessContent = () => {
      if (fallbackPassword) {
          return (
             <div className="text-center py-4">
                <div className="mb-4 flex justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <p className="text-lg font-semibold text-gray-800 mb-2">Email Failed to Send</p>
                <p className="text-gray-600 mb-4">Your Mailgun API keys may not be configured. Please use the temporary password below to log in.</p>
                <div className="mt-4 p-3 bg-gray-100 rounded-md">
                    <p className="text-sm text-gray-600">Temporary Password:</p>
                    <div className="flex items-center justify-between">
                        <code className="text-lg font-mono text-primary">{fallbackPassword}</code>
                        <Button size="sm" variant="secondary" onClick={() => copyToClipboard(fallbackPassword)}>Copy</Button>
                    </div>
                </div>
                 <div className="flex justify-center mt-6">
                    <Button onClick={handleClose}>Return to Login</Button>
                 </div>
             </div>
          );
      }
      
      return (
         <div className="text-center py-4">
           <div className="mb-4 flex justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
           </div>
          <p className="text-lg font-semibold text-gray-800 mb-2">Email Sent!</p>
          <p className="text-gray-600 mb-6">If a KVPDA account exists for <strong>{email}</strong>, you will receive an email containing your temporary password shortly.</p>
          <div className="flex justify-center">
            <Button onClick={handleClose}>Return to Login</Button>
          </div>
        </div>
      );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Forgot Password">
      {submitted ? (
        renderSuccessContent()
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-gray-600">Enter your registered email address. We will generate a temporary password and email it to you.</p>
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
            autoFocus
            disabled={loading}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end pt-4 gap-4">
            <Button type="button" variant="secondary" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={!email || loading}>
              {loading ? 'Sending...' : 'Reset Password'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default ForgotPasswordModal;