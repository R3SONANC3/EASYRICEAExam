import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-green-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-white text-2xl font-bold">EASYRICE TEST</span>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a href="#" className="text-white hover:bg-green-600 px-3 py-2 rounded-md text-sm font-medium">Dashboard</a>
              <a href="#" className="text-green-300 hover:bg-green-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Inspections</a>
              <a href="#" className="text-green-300 hover:bg-green-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Reports</a>
            </div>
          </div>
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-green-300 hover:text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="#" className="text-white block px-3 py-2 rounded-md text-base font-medium">Dashboard</a>
            <a href="#" className="text-green-300 hover:bg-green-600 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Inspections</a>
            <a href="#" className="text-green-300 hover:bg-green-600 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Reports</a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;