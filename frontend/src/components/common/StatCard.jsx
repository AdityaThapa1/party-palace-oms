import React from 'react';

const StatCard = ({ title, value, icon, colorClass = "bg-primary" }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase">{title}</p>
        <p className="mt-1 text-3xl font-semibold text-dark">{value}</p>
      </div>
      <div className={`p-3 rounded-full text-white ${colorClass}`}>
        <span className="h-6 w-6 text-2xl">{icon}</span>
      </div>
    </div>
  );
};

export default StatCard;