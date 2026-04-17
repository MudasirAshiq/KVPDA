
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { DealerActivity } from '../../types';
import Card from '../common/Card';
import Table from '../common/Table';
import Button from '../common/Button';
import { formatDateTime } from '../../utils/helpers';
import Alert from '../common/Alert';
import Badge from '../common/Badge';

const ActivityMonitorPage: React.FC = () => {
    const [activityData, setActivityData] = useState<DealerActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sendingEmail, setSendingEmail] = useState<string | null>(null); // dealer_id
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const data = await api.getDealerActivity();
                setActivityData(data);
            } catch (err) {
                setError('Failed to fetch dealer activity.');
            } finally {
                setLoading(false);
            }
        };
        fetchActivity();
    }, []);

    const handleSendReminder = async (dealerId: string, companyName: string) => {
        setSendingEmail(dealerId);
        setError('');
        setSuccessMessage('');
        try {
            await api.sendEngagementReminderEmail(dealerId, companyName);
            setSuccessMessage(`Engagement reminder sent successfully to ${companyName}.`);
             setTimeout(() => setSuccessMessage(''), 5000); // Clear message after 5s
        } catch (err) {
            setError(`Failed to send reminder to ${companyName}.`);
        } finally {
            setSendingEmail(null);
        }
    };
    
    const getActivityStatus = (lastActivityDate: string | null): { text: string; color: 'green' | 'yellow' | 'gray' } => {
        if (!lastActivityDate) {
            return { text: 'Never Active', color: 'gray' };
        }
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        if (new Date(lastActivityDate) > thirtyDaysAgo) {
            return { text: 'Active', color: 'green' };
        } else {
            return { text: 'Inactive', color: 'yellow' };
        }
    };

    if (loading) {
        return (
            <Card>
                <div className="text-center p-8 text-gray-500">Loading activity monitor...</div>
            </Card>
        );
    }

    return (
        <Card title="Dealer Activity Monitor">
            <div className="mb-4 space-y-2">
                {error && <Alert variant="danger" message={error} onClose={() => setError('')} />}
                {successMessage && <Alert variant="success" message={successMessage} onClose={() => setSuccessMessage('')} />}
            </div>

            <p className="mb-6 text-sm text-gray-600">This monitor shows the last time a dealer performed a significant action (e.g., creating/terminating an employee or customer). Use this to track engagement.</p>

            {activityData.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No dealers found to monitor.</p>
            ) : (
                <Table headers={['Dealer', 'Last Activity', 'Status', 'Actions']}>
                    {activityData.map(dealer => {
                        const status = getActivityStatus(dealer.last_activity_date);
                        return (
                            <tr key={dealer.dealer_id} className="text-gray-700">
                                <td className="px-4 py-3 text-sm font-medium">{dealer.company_name}</td>
                                <td className="px-4 py-3 text-sm">
                                    {dealer.last_activity_date ? formatDateTime(dealer.last_activity_date) : 'N/A'}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                    <Badge color={status.color}>{status.text}</Badge>
                                </td>
                                <td className="px-4 py-3 text-sm">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => handleSendReminder(dealer.dealer_id, dealer.company_name)}
                                        disabled={sendingEmail === dealer.dealer_id}
                                    >
                                        {sendingEmail === dealer.dealer_id ? 'Sending...' : 'Send Reminder'}
                                    </Button>
                                </td>
                            </tr>
                        )
                    })}
                </Table>
            )}
        </Card>
    );
};

export default ActivityMonitorPage;
