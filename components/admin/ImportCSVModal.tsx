
import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { api } from '../../services/api';
import Alert from '../common/Alert';

interface ImportCSVModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

const ImportCSVModal: React.FC<ImportCSVModalProps> = ({ isOpen, onClose, onImportSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<any[]>([]);
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [importResult, setImportResult] = useState<{success: number, fails: number, errors: string[]} | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.type === 'text/csv') {
            setFile(selectedFile);
            setError('');
            parseCSV(selectedFile);
        } else {
            setFile(null);
            setParsedData([]);
            setError('Please select a valid .csv file.');
        }
    };

    const parseCSV = (csvFile: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
            if (lines.length < 2) {
                setError('CSV must have a header row and at least one data row.');
                return;
            }
            const headers = lines[0].split(',').map(h => h.trim());
            const data = lines.slice(1).map(line => {
                const values = line.split(',');
                return headers.reduce((obj, header, index) => {
                    // @ts-ignore
                    obj[header] = values[index]?.trim() || '';
                    return obj;
                }, {});
            });
            setParsedData(data);
        };
        reader.readAsText(csvFile);
    };

    const handleImport = async () => {
        if (parsedData.length === 0) {
            setError('No data to import.');
            return;
        }
        setIsProcessing(true);
        setError('');
        try {
            const result = await api.importDealersFromCSV(parsedData);
            setImportResult(result);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setParsedData([]);
        setError('');
        setImportResult(null);
        if (importResult && importResult.success > 0) {
            onImportSuccess();
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={importResult ? "Import Complete" : "Import Dealers from CSV"}>
            {importResult ? (
                <div>
                    <Alert variant={importResult.fails > 0 ? 'warning' : 'success'}>
                        <p><strong>{importResult.success}</strong> dealers imported successfully.</p>
                        {importResult.fails > 0 && <p><strong>{importResult.fails}</strong> dealers failed to import.</p>}
                    </Alert>
                    {importResult.errors.length > 0 && (
                        <div className="mt-4 max-h-40 overflow-y-auto bg-gray-100 p-2 rounded">
                            <h4 className="font-semibold text-sm">Error Details:</h4>
                            <ul className="list-disc list-inside text-xs">
                                {importResult.errors.slice(0, 10).map((e, i) => <li key={i}>{e}</li>)}
                            </ul>
                        </div>
                    )}
                    <div className="flex justify-end mt-6">
                        <Button onClick={handleClose}>Close</Button>
                    </div>
                </div>
            ) : (
                <div>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
                        <p><strong>Required CSV Headers:</strong></p>
                        <code className="block mt-2 text-xs break-all">company_name,primary_contact_name,primary_contact_email,primary_contact_phone,address,username</code>
                    </div>
                    <div className="mt-4">
                        <input type="file" accept=".csv" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary hover:file:bg-blue-100"/>
                    </div>
                    {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                    {parsedData.length > 0 && (
                        <div className="mt-4">
                            <p className="text-sm font-medium mb-2">Found {parsedData.length} records to import:</p>
                            <div className="max-h-60 overflow-y-auto bg-gray-50 p-2 rounded border">
                                <ul className="text-xs">
                                    {parsedData.slice(0, 5).map((d, i) => <li key={i}>{d.company_name} ({d.primary_contact_email})</li>)}
                                    {parsedData.length > 5 && <li>...and {parsedData.length - 5} more.</li>}
                                </ul>
                            </div>
                        </div>
                    )}
                    <div className="flex justify-end gap-4 mt-6">
                        <Button variant="secondary" onClick={handleClose} disabled={isProcessing}>Cancel</Button>
                        <Button onClick={handleImport} disabled={parsedData.length === 0 || isProcessing}>
                            {isProcessing ? 'Importing...' : `Import ${parsedData.length} Dealers`}
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default ImportCSVModal;
