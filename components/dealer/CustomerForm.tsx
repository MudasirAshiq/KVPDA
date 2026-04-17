
import React, { useState, useEffect } from 'react';
import { Customer, DuplicateCheckResult } from '../../types';
import Input from '../common/Input';
import Button from '../common/Button';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import Alert from '../common/Alert';

interface CustomerFormProps {
  customer: Customer | null;
  onSave: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onSave }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        type: 'private' as 'private' | 'government',
        name_or_entity: '',
        contact_person: '',
        phone: '',
        email: '',
        official_id: '',
        address: ''
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [duplicateWarnings, setDuplicateWarnings] = useState<{
        phone: DuplicateCheckResult | null;
        official_id: DuplicateCheckResult | null;
        email: DuplicateCheckResult | null;
    }>({ phone: null, official_id: null, email: null });

    useEffect(() => {
        if (customer) {
            setFormData({
                type: customer.type,
                name_or_entity: customer.name_or_entity,
                contact_person: customer.contact_person || '',
                phone: customer.phone,
                email: customer.email || '',
                official_id: customer.official_id,
                address: customer.address,
            });
        } else {
            setFormData({
                type: 'private',
                name_or_entity: '',
                contact_person: '',
                phone: '',
                email: '',
                official_id: '',
                address: ''
            });
        }
        setError('');
        setDuplicateWarnings({ phone: null, official_id: null, email: null });
    }, [customer]);

    // Duplicate Check Logic
    useEffect(() => {
        const checkDupes = async () => {
            // Phone Check
            if (formData.phone && formData.phone.length === 10) {
                const res = await api.checkEntityDuplicate('customer', 'phone', formData.phone, customer?.id);
                setDuplicateWarnings(prev => ({ ...prev, phone: res }));
            } else {
                setDuplicateWarnings(prev => ({ ...prev, phone: null }));
            }

            // ID Check
            if (formData.official_id) {
                const res = await api.checkEntityDuplicate('customer', 'official_id', formData.official_id, customer?.id);
                setDuplicateWarnings(prev => ({ ...prev, official_id: res }));
            } else {
                setDuplicateWarnings(prev => ({ ...prev, official_id: null }));
            }

            // Email Check
            if (formData.email) {
                const res = await api.checkEntityDuplicate('customer', 'email', formData.email, customer?.id);
                setDuplicateWarnings(prev => ({ ...prev, email: res }));
            } else {
                setDuplicateWarnings(prev => ({ ...prev, email: null }));
            }
        };

        const timer = setTimeout(checkDupes, 500);
        return () => clearTimeout(timer);
    }, [formData.phone, formData.official_id, formData.email, customer]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'phone' && 'maxLength' in e.target) {
            const sanitizedValue = value.replace(/\D/g, '').slice(0, 10);
            setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        
        setIsSubmitting(true);
        setError('');

        const submissionData = {
            ...formData,
            contact_person: formData.type === 'government' ? formData.contact_person : undefined,
            email: formData.email.trim() || undefined,
        };

        try {
            if (customer) {
                await api.updateCustomer(customer.id, submissionData);
            } else {
                // @ts-ignore
                await api.createCustomer(submissionData);
            }
            onSave();
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const isBlocked = !!duplicateWarnings.phone || !!duplicateWarnings.official_id || !!duplicateWarnings.email;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Customer Type</label>
                <select 
                    id="type" 
                    name="type" 
                    value={formData.type} 
                    onChange={handleChange} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-black focus:outline-none focus:ring-primary focus:border-primary sm:text-sm disabled:bg-white disabled:text-black disabled:opacity-100" 
                    style={{ backgroundColor: 'white', color: 'black' }}
                    disabled={isSubmitting}
                >
                    <option value="private">Private</option>
                    <option value="government">Government</option>
                </select>
            </div>
            <Input label={formData.type === 'private' ? 'Full Name' : 'Entity Name'} name="name_or_entity" value={formData.name_or_entity} onChange={handleChange} required disabled={isSubmitting} />
            {formData.type === 'government' && (
                <Input label="Contact Person" name="contact_person" value={formData.contact_person} onChange={handleChange} disabled={isSubmitting} />
            )}
            
            <div className="space-y-1">
                <Input label="Email (Optional)" name="email" type="email" value={formData.email} onChange={handleChange} disabled={isSubmitting} />
                {duplicateWarnings.email && (
                    <p className="text-xs text-amber-600 font-semibold">
                        ⚠️ Registered with: {duplicateWarnings.email.ownerName} ({duplicateWarnings.email.entityName})
                    </p>
                )}
            </div>
            
            <div className="space-y-1">
                <Input label="Phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required maxLength={10} disabled={isSubmitting} />
                {duplicateWarnings.phone && (
                    <p className="text-xs text-amber-600 font-semibold">
                        ⚠️ Registered with: {duplicateWarnings.phone.ownerName} ({duplicateWarnings.phone.entityName})
                    </p>
                )}
            </div>

            <div className="space-y-1">
                <Input label={formData.type === 'private' ? 'Official ID (e.g., Driver License)' : 'Official ID (e.g., Tax ID)'} name="official_id" value={formData.official_id} onChange={handleChange} required disabled={isSubmitting} />
                {duplicateWarnings.official_id && (
                    <p className="text-xs text-amber-600 font-semibold">
                        ⚠️ Registered with: {duplicateWarnings.official_id.ownerName} ({duplicateWarnings.official_id.entityName})
                    </p>
                )}
            </div>

            <Input label="Address" name="address" value={formData.address} onChange={handleChange} required textarea rows={3} disabled={isSubmitting} />
            
            {isBlocked && (
                 <div className="mt-2">
                    <Alert variant="warning">
                        <div className="text-yellow-800">
                             <p className="font-bold">Duplicate customer found.</p>
                             <p className="text-sm mt-1">The Email, Phone Number, or Official ID provided is already registered to another active customer in the network. Please verify.</p>
                        </div>
                    </Alert>
                 </div>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting || isBlocked}>
                {isSubmitting ? 'Saving...' : (customer ? 'Save Changes' : 'Create Customer')}
                </Button>
            </div>
        </form>
    );
};

export default CustomerForm;
