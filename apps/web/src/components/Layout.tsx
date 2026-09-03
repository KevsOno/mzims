import React from 'react';
import Header from './Header';
import Footer from './Footer';
import Chatbot from './Chatbot';
import { Toaster } from 'react-hot-toast';   // <-- Import

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <Chatbot />
      <Toaster position="top-center" reverseOrder={false} />  {/* Add this line */}
    </div>
  );
};

export default Layout;
