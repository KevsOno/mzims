import React from 'react';
import Header from './Header';
import Footer from './Footer';
import Chatbot from './Chatbot';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <Chatbot />
    </div>
  );
};

export default Layout;
