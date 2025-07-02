import React from 'react';

const PageHeader = ({ title, children }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-dark mb-4 sm:mb-0">{title}</h1>
      <div className="flex space-x-2">
        {children}
      </div>
    </div>
  );
};

export default PageHeader;