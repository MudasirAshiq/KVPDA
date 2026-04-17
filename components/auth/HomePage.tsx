import React from 'react';
import Button from '../common/Button';

interface HomePageProps {
    onAdminLogin: () => void;
    onDealerLogin: () => void;
    onContactUs: () => void;
}

const ShieldCheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const UserGroupIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.28-1.25-1.455-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.28-1.25 1.455-1.857M12 14a4 4 0 110-8 4 4 0 010 8z" />
  </svg>
);

const SearchCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const HomePage: React.FC<HomePageProps> = ({ onAdminLogin, onDealerLogin, onContactUs }) => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      
      {/* --- Header / Navbar --- */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
          {/* Logo Section */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
            <img src="/favicon.svg" alt="KVPDA Logo" className="h-10 w-10 shrink-0 object-contain" />
            <div className="leading-tight text-left">
                <h1 className="text-lg font-bold text-slate-800">KVPDA</h1>
                <p className="text-xs text-slate-500 hidden md:block">Kashmir Valley Tank Owners & Petroleum Dealers Association</p>
            </div>
          </div>
          
          {/* Buttons Section - Full width on mobile, auto on desktop */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
             <Button onClick={onContactUs} variant="secondary" className="flex-1 sm:flex-none justify-center border border-transparent font-medium whitespace-nowrap">
              Contact Us
            </Button>
            <Button onClick={onDealerLogin} variant="secondary" className="flex-1 sm:flex-none justify-center border border-gray-300 font-medium whitespace-nowrap">
              Dealer Login
            </Button>
            <Button onClick={onAdminLogin} className="flex-1 sm:flex-none justify-center font-medium whitespace-nowrap">
              Admin Login
            </Button>
          </div>
        </div>
      </header>

      {/* --- Hero Section --- */}
      <section className="relative bg-slate-900 text-white py-12 md:py-24 overflow-hidden">
        {/* Abstract Background Pattern */}
        <div className="absolute inset-0 opacity-10">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
            </svg>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-block px-4 py-1 bg-blue-900 text-blue-200 rounded-full text-xs md:text-sm font-semibold mb-6 border border-blue-700">
            Since 1995 — The United Voice of Kashmir's Petroleum Trade
          </div>
          <h1 className="text-3xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Fueling Unity, <br/>
            <span className="text-blue-400">Protecting Interests,</span> <br/>
            Driving Progress
          </h1>
          <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto mb-10">
            We are the collective voice of petroleum dealers and tank owners across the Kashmir Valley. We protect dealer rights, promote fair trade, and keep the industry strong, local, and ready for the future.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button onClick={onDealerLogin} className="w-full sm:w-auto px-8 py-3 text-lg">
                Dealer Login
            </Button>
          </div>
        </div>
      </section>

      {/* --- Mission & How it Works --- */}
      <section className="py-12 md:py-20 bg-slate-50">
        <div className="container mx-auto px-6">
            <div className="text-center mb-12 md:mb-16">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">Our Mission & Services</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    A secure portal for members of the Kashmir Petroleum Dealers Association to manage employees, customers, and search the shared union registry.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
                    <div className="flex justify-center"><UserGroupIcon /></div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Register Members</h3>
                    <p className="text-gray-600 text-sm md:text-base">
                        Add dealers, employees, and clients to a unified registry with complete tracking and digital profiles.
                    </p>
                </div>
                <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
                    <div className="flex justify-center"><SearchCircleIcon /></div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Track & Search</h3>
                    <p className="text-gray-600 text-sm md:text-base">
                        Quickly find employment history, client assignments, and vehicle registrations across the entire valley network.
                    </p>
                </div>
                <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
                    <div className="flex justify-center"><ShieldCheckIcon /></div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Manage Transfers</h3>
                    <p className="text-gray-600 text-sm md:text-base">
                        Handle client transfers between dealers with proper approvals, audit trails, and conflict resolution.
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* --- Live Map Section --- */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                <div className="md:w-1/2">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4 md:mb-6">Live Fuel Station Map & Prices</h2>
                    <p className="text-gray-600 mb-6 text-base md:text-lg">
                        Find nearby petrol pumps across the Srinagar and Kashmir region. Our live map is powered by OpenStreetMap and provides real-time location data for dealers and customers alike.
                    </p>
                </div>
                <div className="w-full md:w-1/2 h-64 md:h-80 bg-gray-200 rounded-xl overflow-hidden shadow-inner border border-gray-300 relative">
                    <iframe 
                        width="100%" 
                        height="100%" 
                        frameBorder="0" 
                        scrolling="no" 
                        marginHeight={0} 
                        marginWidth={0} 
                        src="https://www.openstreetmap.org/export/embed.html?bbox=74.7500,34.0000,74.9000,34.1500&amp;layer=mapnik" 
                        style={{ border: 0 }}
                        title="Kashmir Fuel Map"
                    ></iframe>
                    <div className="absolute bottom-0 left-0 bg-white/80 px-2 py-1 text-xs text-gray-600">
                        <a href="https://www.openstreetmap.org" target="_blank" rel="noopener noreferrer">© OpenStreetMap contributors</a>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* --- Leadership Section --- */}
      <section className="py-12 md:py-20 bg-slate-900 text-slate-300">
        <div className="container mx-auto px-6">
            <div className="text-center mb-12 md:mb-16">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Association Leadership</h2>
                <p className="max-w-2xl mx-auto text-slate-400">
                    Guided by a legacy of strength and integrity since 1995.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                
                {/* Current Office Bearers */}
                <div className="bg-slate-800 rounded-xl p-6 md:p-8 border border-slate-700">
                    <h3 className="text-xl font-bold text-white mb-6 border-b border-slate-700 pb-4">Current Office Bearers</h3>
                    <ul className="space-y-4">
                        <li>
                            <p className="font-semibold text-white">Er. Javed Ahmed Ashai</p>
                            <p className="text-sm text-blue-400">President</p>
                        </li>
                        <li>
                            <p className="font-semibold text-white">Mr. Majid Mushtaq Rafiquee</p>
                            <p className="text-sm text-blue-400">Vice President</p>
                        </li>
                        <li>
                            <p className="font-semibold text-white">Mr. Mohammad Shafi Khanday</p>
                            <p className="text-sm text-blue-400">General Secretary</p>
                        </li>
                        <li>
                            <p className="font-semibold text-white">Mr. Mohd Altaf Pandit</p>
                            <p className="text-sm text-blue-400">Secretary</p>
                        </li>
                    </ul>
                </div>

                {/* Past Presidents */}
                <div className="bg-slate-800 rounded-xl p-6 md:p-8 border border-slate-700">
                    <h3 className="text-xl font-bold text-white mb-6 border-b border-slate-700 pb-4">Past Presidents</h3>
                    <ul className="space-y-4">
                        <li>
                            <p className="font-semibold text-white">Haji Ghulam Mohi Ud Din Rafiquee</p>
                            <p className="text-sm text-slate-400">Founding President</p>
                        </li>
                        <li>
                            <p className="font-semibold text-white">Haji Abdul Ahad Pandit</p>
                            <p className="text-sm text-slate-400">Past President</p>
                        </li>
                        <li>
                            <p className="font-semibold text-white">Haji Mushtaq Ahmed Rafiquee</p>
                            <p className="text-sm text-slate-400">Past President</p>
                        </li>
                    </ul>
                </div>

                {/* Legacy */}
                <div className="bg-slate-800 rounded-xl p-6 md:p-8 border border-slate-700">
                    <h3 className="text-xl font-bold text-white mb-6 border-b border-slate-700 pb-4">Our Legacy</h3>
                    <p className="text-sm leading-relaxed mb-4">
                        The foundation was laid by <span className="text-white font-semibold">Late Haji Ghulam Mohi-ud-din Rafiquee Sahib</span>, unanimously elected lifelong President.
                    </p>
                    <p className="text-sm leading-relaxed mb-6">
                        Official registration and bye-laws were undertaken by <span className="text-white font-semibold">Mohammed Shafi Khanday</span>, supported by the founding members.
                    </p>
                    <div>
                        <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-2">Founding Members</p>
                        <ul className="text-sm space-y-1 text-slate-300">
                            <li>• Late Haji Ghulam Mohi-ud-din Rafiquee</li>
                            <li>• Mohammed Shafi Khanday</li>
                            <li>• Abdul Ahad Pandit</li>
                            <li>• Mushtaq Ahmed Rafiquee</li>
                        </ul>
                    </div>
                </div>

            </div>
        </div>
      </section>

      {/* --- Simple Footer Callout --- */}
      <div className="bg-white py-12 border-t border-gray-200 text-center">
        <div className="container mx-auto px-6">
             <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to access the registry?</h2>
             <div className="flex justify-center gap-4">
                <Button onClick={onDealerLogin} className="w-full sm:w-auto">Access Dealer Portal</Button>
             </div>
        </div>
      </div>

    </div>
  );
};

export default HomePage;