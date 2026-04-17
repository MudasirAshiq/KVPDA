
import React from 'react';

interface TableProps {
  headers: string[];
  children: React.ReactNode;
}

const Table: React.FC<TableProps> = ({ headers, children }) => {
  return (
    <div className="w-full overflow-hidden rounded-lg shadow-xs">
      <div className="w-full overflow-x-auto">
        <table className="w-full whitespace-no-wrap">
          <thead>
            <tr className="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b bg-gray-50">
              {headers.map((header, index) => (
                <th key={index} className="px-4 py-3">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
