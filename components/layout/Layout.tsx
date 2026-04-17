
import React, { useState, ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import ChangePasswordModal from '../auth/ChangePasswordModal';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(() => {
    return sessionStorage.getItem('currentPage') || 'Dashboard';
  });

  const handleSetCurrentPage = (page: string) => {
    sessionStorage.setItem('currentPage', page);
    setCurrentPage(page);
  }

  return (
    <div className="flex flex-grow bg-gray-100">
      <ChangePasswordModal />
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        currentPage={currentPage}
        setCurrentPage={handleSetCurrentPage}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background">
          <div className="container mx-auto px-6 py-8">
            {React.Children.map(children, child =>
              React.isValidElement(child)
                ? React.cloneElement(child, { currentPage: currentPage } as any)
                : child
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
