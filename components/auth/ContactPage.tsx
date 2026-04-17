import React from 'react';
import Button from '../common/Button';

interface ContactPageProps {
  onBack: () => void;
}

const MailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
);

const ContactPage: React.FC<ContactPageProps> = ({ onBack }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
       <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
             <div className="flex items-center gap-3">
                <img src="/favicon.svg" alt="KVPDA Logo" className="h-10 w-10 object-contain" />
                <h1 className="text-xl font-bold text-slate-800">KVPDA</h1>
            </div>
            <Button onClick={onBack} variant="secondary">Back to Home</Button>
        </div>
       </header>

       <main className="flex-grow flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg border p-8 md:p-12 text-center">
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4">Contact Us</h2>
                <p className="text-gray-600 mb-8 md:mb-12 max-w-md mx-auto">
                    We're here to help. Reach out to the association through any of the channels below.
                </p>

                <div className="space-y-6 text-left">
                    <div className="flex items-center p-4 bg-gray-50 rounded-lg border">
                        <MailIcon />
                        <div>
                            <p className="font-semibold text-gray-700">Email</p>
                            <a href="mailto:kvto.pd.association@gmail.com" className="text-gray-600 hover:text-primary">kvto.pd.association@gmail.com</a>
                            <br />
                            <a href="mailto:contact@kvpda.com" className="text-gray-600 hover:text-primary">contact@kvpda.com</a>
                        </div>
                    </div>
                    <div className="flex items-center p-4 bg-gray-50 rounded-lg border">
                        <PhoneIcon />
                        <div>
                            <p className="font-semibold text-gray-700">Phone</p>
                            <a href="tel:+917006116817" className="text-gray-600 hover:text-primary">+91 70061 16817</a>
                        </div>
                    </div>
                </div>
            </div>
       </main>
    </div>
  );
};

export default ContactPage;