
import React, { useState, useEffect, useCallback } from 'react';
import { Dealer } from '../../types';
import Input from '../common/Input';
import Button from '../common/Button';
import { api } from '../../services/api';

interface DealerFormProps {
  dealer: Dealer | null;
  onSave: (data: Omit<Dealer, 'id' | 'status' | 'created_at' | 'user_id'> & { username: string }) => Promise<void>;
  onCancel: () => void;
  formError?: string;
}

type AvailabilityStatus = 'idle' | 'loading' | 'available' | 'taken';

const DealerForm: React.FC<DealerFormProps> = ({ dealer, onSave, onCancel, formError }) => {
  const [formData, setFormData] = useState({
    company_name: '',
    primary_contact_name: '',
    primary_contact_email: '',
    primary_contact_phone: '',
    address: '',
    username: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Availability State
  const [availability, setAvailability] = useState<{
    username: AvailabilityStatus;
    email: AvailabilityStatus;
    phone: AvailabilityStatus;
  }>({
    username: 'idle',
    email: 'idle',
    phone: 'idle'
  });

  useEffect(() => {
    if (dealer) {
        setFormData({
            company_name: dealer.company_name,
            primary_contact_name: dealer.primary_contact_name,
            primary_contact_email: dealer.primary_contact_email,
            primary_contact_phone: dealer.primary_contact_phone,
            address: dealer.address,
            username: '', // Username is not editable here
        });
    } else {
        setFormData({
            company_name: '',
            primary_contact_name: '',
            primary_contact_email: '',
            primary_contact_phone: '',
            address: '',
            username: '',
        });
    }
    // Reset availability
    setAvailability({ username: 'idle', email: 'idle', phone: 'idle' });
  }, [dealer]);

  // Debounce Check Logic
  const checkAvailability = useCallback(async (field: 'username' | 'email' | 'phone', value: string) => {
      if (!value) {
          setAvailability(prev => ({ ...prev, [field]: 'idle' }));
          return;
      }
      
      // If editing, we don't need to check email as it's disabled.
      // Phone checking in edit mode is tricky (it checks itself), assuming simple create mode check for now mostly.
      if (dealer && field === 'email') return; 
      if (dealer && field === 'phone' && value === dealer.primary_contact_phone) {
          setAvailability(prev => ({ ...prev, [field]: 'idle' }));
          return; 
      }

      setAvailability(prev => ({ ...prev, [field]: 'loading' }));
      
      try {
          // Simple timeout to debounce if called rapidly in a real app, 
          // but here we just call API which is fast enough or we rely on the useEffect delay below.
          const isAvailable = await api.checkAvailability(field, value);
          setAvailability(prev => ({ ...prev, [field]: isAvailable ? 'available' : 'taken' }));
      } catch (error) {
          setAvailability(prev => ({ ...prev, [field]: 'idle' }));
      }
  }, [dealer]);


  // Effects for live typing
  useEffect(() => {
    const timer = setTimeout(() => {
        if (formData.username && !dealer) checkAvailability('username', formData.username);
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.username, dealer, checkAvailability]);

  useEffect(() => {
    const timer = setTimeout(() => {
        if (formData.primary_contact_email && !dealer) checkAvailability('email', formData.primary_contact_email);
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.primary_contact_email, dealer, checkAvailability]);

  useEffect(() => {
    const timer = setTimeout(() => {
        if (formData.primary_contact_phone && formData.primary_contact_phone.length === 10) {
            checkAvailability('phone', formData.primary_contact_phone);
        } else if (formData.primary_contact_phone.length !== 10) {
             setAvailability(prev => ({ ...prev, phone: 'idle' }));
        }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.primary_contact_phone, dealer, checkAvailability]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'primary_contact_phone') {
        const sanitizedValue = value.replace(/\D/g, '').slice(0, 10);
        setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
    } else if (name === 'username') {
        setFormData(prev => ({ ...prev, [name]: value.replace(/\s/g, '') }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
        await onSave(formData);
    } catch (e) {
        // Parent handles error
    } finally {
        setIsSubmitting(false);
    }
  };

  // Helper to render status message
  const renderStatus = (status: AvailabilityStatus) => {
      if (status === 'loading') return <span className="text-xs text-gray-500">Checking availability...</span>;
      if (status === 'available') return <span className="text-xs text-green-600 font-medium">✅ Available</span>;
      if (status === 'taken') return <span className="text-xs text-red-600 font-medium">❌ Already taken</span>;
      return null;
  };

  // Block submit if anything is taken
  const isBlocked = availability.username === 'taken' || availability.email === 'taken' || availability.phone === 'taken';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Company Name"
        name="company_name"
        value={formData.company_name}
        onChange={handleChange}
        required
        disabled={isSubmitting}
      />
      
      {!dealer && (
          <div className="relative">
            <Input
                label="Username (for login)"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                placeholder="e.g. kashmirfuels"
                className={availability.username === 'taken' ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : (availability.username === 'available' ? 'border-green-500 focus:border-green-500 focus:ring-green-200' : '')}
            />
            <div className="absolute top-1 right-1">
                {renderStatus(availability.username)}
            </div>
          </div>
      )}

      <Input
        label="Contact Name"
        name="primary_contact_name"
        value={formData.primary_contact_name}
        onChange={handleChange}
        required
        disabled={isSubmitting}
      />
      
      <div className="relative">
        <Input
            label="Contact Email"
            name="primary_contact_email"
            type="email"
            value={formData.primary_contact_email}
            onChange={handleChange}
            required
            disabled={isSubmitting || !!dealer} 
            className={availability.email === 'taken' ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : (availability.email === 'available' ? 'border-green-500 focus:border-green-500 focus:ring-green-200' : '')}
        />
         <div className="absolute top-1 right-1">
            {renderStatus(availability.email)}
        </div>
      </div>

      <div className="relative">
        <Input
            label="Contact Phone"
            name="primary_contact_phone"
            type="tel"
            value={formData.primary_contact_phone}
            onChange={handleChange}
            required
            maxLength={10}
            disabled={isSubmitting}
            className={availability.phone === 'taken' ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : (availability.phone === 'available' ? 'border-green-500 focus:border-green-500 focus:ring-green-200' : '')}
        />
        <div className="absolute top-1 right-1">
            {renderStatus(availability.phone)}
        </div>
      </div>

      <Input
        label="Address"
        name="address"
        value={formData.address}
        onChange={handleChange}
        required
        textarea
        rows={3}
        disabled={isSubmitting}
      />

      {formError && <p className="text-sm text-red-600">{formError}</p>}
      
      <div className="flex justify-end pt-4 gap-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || isBlocked}>
          {isSubmitting ? 'Saving...' : (dealer ? 'Save Changes' : 'Create Dealer')}
        </Button>
      </div>
    </form>
  );
};

export default DealerForm;
