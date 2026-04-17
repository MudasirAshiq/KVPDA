import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import ProfileModal from '../common/ProfileModal';

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}


const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);


const Header: React.FC<HeaderProps> = ({ setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setProfileModalOpen(true);
    setDropdownOpen(false);
  };

  return (
    <>
      <header className="flex justify-between items-center py-4 px-6 bg-surface border-b-2 border-gray-100">
        <div className="flex items-center">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-500 focus:outline-none lg:hidden">
              <MenuIcon />
          </button>
        </div>

        <div className="flex items-center">
          <div className="relative">
            <button onClick={() => setDropdownOpen(prev => !prev)} className="relative block h-10 w-10 rounded-full overflow-hidden focus:outline-none transition-transform hover:scale-110">
              <img src="/favicon.svg" alt="Profile" className="h-full w-full object-contain" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md overflow-hidden shadow-xl z-10">
                <div className="block px-4 py-2 text-sm text-gray-700">
                  <p className="font-bold">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <a href="#" onClick={handleProfileClick} className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary hover:text-white">Profile</a>
                <a href="#" onClick={logout} className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary hover:text-white">Logout</a>
              </div>
            )}
          </div>
        </div>
      </header>
      {user && <ProfileModal user={user} isOpen={isProfileModalOpen} onClose={() => setProfileModalOpen(false)} />}
    </>
  );
};

export default Header;