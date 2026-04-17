import React from 'react';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-1a6 6 0 00-5.176-5.973" />
    </svg>
);

const CustomersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
);

const AuditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const EmployeeSearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
)

const ActivityIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h2.5l2.5-5 2.5 10 2.5-5h2.5" />
    </svg>
);


const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen, currentPage, setCurrentPage }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const navItems = isAdmin ? [
    { icon: <DashboardIcon />, label: "Dashboard" },
    { icon: <UsersIcon />, label: "Dealers" },
    { icon: <ActivityIcon />, label: "Activity Monitor" },
    { icon: <AuditIcon />, label: "Audit Logs" },
    { icon: <EmployeeSearchIcon />, label: "Universal Search" },
  ] : [
    { icon: <DashboardIcon />, label: "Dashboard" },
    { icon: <UsersIcon />, label: "Employees" },
    { icon: <CustomersIcon />, label: "Customers" },
    { icon: <EmployeeSearchIcon />, label: "Universal Search" },
  ];

  const handleNavClick = (label: string) => {
    setCurrentPage(label);
    setSidebarOpen(false);
  };

  return (
    <>
      <div className={`fixed inset-0 bg-black bg-opacity-25 z-20 transition-opacity lg:hidden ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setSidebarOpen(false)}></div>
      <div className={`flex flex-col w-64 bg-gray-800 text-white fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-200 ease-in-out z-30`}>
        <div className="flex items-center justify-center mt-8">
          <div className="flex items-center">
            <img src="/favicon.svg" alt="KVPDA Logo" className="h-10 w-10 mr-2" />
            <span className="text-white text-2xl mx-2 font-semibold">KVPDA</span>
          </div>
        </div>
        <nav className="mt-10">
          {navItems.map((item, index) => {
             const isActive = currentPage === item.label;
             return (
                <a 
                    key={index} 
                    className={`flex items-center mt-4 py-2 px-6 cursor-pointer ${isActive ? 'bg-gray-700 bg-opacity-25 text-gray-100 border-l-4 border-primary' : 'hover:bg-gray-700 hover:bg-opacity-25 hover:text-gray-100'}`} 
                    onClick={() => handleNavClick(item.label)}
                >
                {item.icon}
                <span className="mx-3">{item.label}</span>
                </a>
            )
          })}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;