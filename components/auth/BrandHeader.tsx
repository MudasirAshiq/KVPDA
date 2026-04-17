import React from 'react';

interface BrandHeaderProps {
  theme?: 'light' | 'dark';
}

const BrandHeader: React.FC<BrandHeaderProps> = ({ theme = 'light' }) => {
  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-extrabold tracking-tight mb-2">
        {theme === 'light' ? (
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 text-transparent bg-clip-text">
              KVPDA
            </span>
        ) : (
            <span className="text-white">KVPDA</span>
        )}
      </h1>
      <p className={theme === 'light' ? "text-gray-500" : "text-gray-300"}>
        Kashmir Petroleum Dealers Association
      </p>
    </div>
  );
};

export default BrandHeader;