import React from 'react';

const ProgressTracker = ({ total, completed, className = '' }) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-secondary-700">Progress</span>
        <span className="text-sm font-medium text-secondary-700">{percentage}%</span>
      </div>
      <div className="progress-bar">
        <div 
          className="progress-value" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressTracker;
