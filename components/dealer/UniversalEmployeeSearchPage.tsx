
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { GlobalEmployeeHistoryResult } from '../../types';
import Input from '../common/Input';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { formatDate } from '../../utils/helpers';
import Alert from '../common/Alert';

const UniversalEmployeeSearchPage: React.FC = () => {
  const [aadhar, setAadhar] = useState('');
  const [result, setResult] = useState<GlobalEmployeeHistoryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false); 
  const [error, setError] = useState('');

  useEffect(() => {
    const search = async () => {
        if (aadhar.length !== 12) {
            setResult(null);
            setSearched(false);
            setError('');
            return;
        }

        setLoading(true);
        setSearched(true);
        setError('');

        try {
            const searchResult = await api.searchEmployeeByAadhar(aadhar);
            setResult(searchResult);
        } catch (err) {
            setError('The search could not be completed. Please try again later.');
            console.error("Search failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const timer = setTimeout(() => {
        search();
    }, 500); // Debounce for 500ms

    return () => clearTimeout(timer);
  }, [aadhar]);

  const handleAadharChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 12);
    setAadhar(value);
  };

  const getStatusColor = (status: string): 'green' | 'red' | 'gray' => {
      switch (status) {
          case 'active': return 'green';
          case 'terminated': return 'red';
          default: return 'gray';
      }
  }

  return (
    <Card title="Universal Employee Search by Aadhar">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
                <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                        <strong>Privacy Notice:</strong> Search results reveal an employee's full history across the network, including termination details. Use this tool responsibly.
                    </p>
                </div>
            </div>
        </div>
      
        <Input
            label="Aadhar Number"
            placeholder="Start typing a 12-digit Aadhar Number..."
            value={aadhar}
            onChange={handleAadharChange}
            maxLength={12}
            disabled={loading}
            autoFocus
        />

        {error && <div className="mt-4"><Alert message={error} variant="danger" onClose={() => setError('')}/></div>}

        <div className="mt-6">
            {loading && <p className="text-center text-gray-500 py-4">Searching database...</p>}

            {!loading && searched && result && (
                 <Card title="Search Result" className="bg-gray-50">
                    <div className="space-y-2 mb-6 border-b pb-4">
                        <p className="text-2xl font-bold text-primary">{result.first_name} {result.last_name}</p>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                           <p><strong>Aadhar:</strong> {result.aadhar}</p>
                           <p><strong>Phone:</strong> {result.phone}</p>
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Employment History ({result.history.length} record{result.history.length > 1 ? 's' : ''} found)</h3>
                    <div className="space-y-4">
                        {result.history.map((record) => (
                            <div key={record.id} className="p-4 border rounded-lg bg-white shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-gray-800">{record.dealer_name}</p>
                                        <p className="text-sm text-gray-600">{record.position}</p>
                                    </div>
                                    <Badge color={getStatusColor(record.status)}>{record.status}</Badge>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mt-3 text-sm">
                                    <p><strong>Hire Date:</strong> {formatDate(record.hire_date)}</p>
                                    {record.status === 'terminated' && (
                                        <p><strong>Termination Date:</strong> {record.termination_date ? formatDate(record.termination_date) : 'N/A'}</p>
                                    )}
                                </div>
                                {record.status === 'terminated' && (
                                    <div className="mt-3 pt-3 border-t text-sm">
                                        <p><strong>Reason:</strong> {record.termination_reason || 'No reason provided.'}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                 </Card>
            )}

            {!loading && searched && !result && (
                <p className="text-center text-gray-500 py-8">No employee found with the provided Aadhar number across the network.</p>
            )}
        </div>
    </Card>
  );
};

export default UniversalEmployeeSearchPage;
