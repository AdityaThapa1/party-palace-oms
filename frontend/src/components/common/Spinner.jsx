import React from 'react';

const Spinner = ({ size = '8', color = 'primary' }) => {
    return (
        <div 
            className={`w-${size} h-${size} border-4 border-${color} border-t-transparent border-solid rounded-full animate-spin`}
            role="status"
        >
             <span className="sr-only">Loading...</span>
        </div>
    );
};

export default Spinner;