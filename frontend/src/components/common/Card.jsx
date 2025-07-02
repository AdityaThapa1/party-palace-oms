import React from 'react';

const Card = ({ children, title, className, actions }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {(title || actions) && (
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          {title && <h2 className="text-lg font-semibold text-dark">{title}</h2>}
          {actions && <div className="flex space-x-2">{actions}</div>}
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export default Card;