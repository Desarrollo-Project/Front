import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start">
            <p className="text-gray-500 text-sm">&copy; {currentYear} BidHub. All rights reserved.</p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="flex justify-center md:justify-end space-x-6">
              <a className="text-gray-500 hover:text-gray-700 transition-colors">
                Privacy Policy
              </a>
              <a className="text-gray-500 hover:text-gray-700 transition-colors">
                Terms of Service
              </a>
              <a className="text-gray-500 hover:text-gray-700 transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;