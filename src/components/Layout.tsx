import React from 'react';
import { Navbar } from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
  onAddMovie?: () => void;
  showAddMovie?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, onAddMovie, showAddMovie }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar onAddMovie={onAddMovie} showAddMovie={showAddMovie} />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  );
}; 