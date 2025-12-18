import React from 'react';

const LoadingSpinner = ({ size = 'md', text = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className={`spinner ${sizeClasses[size]}`}></div>
      {text && <p className="text-gray-400">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;