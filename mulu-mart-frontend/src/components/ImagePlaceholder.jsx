import React from 'react';

const ImagePlaceholder = ({ width = 300, height = 200, text = 'No Image', className = '' }) => {
  return (
    <div 
      className={`bg-gray-200 flex items-center justify-center ${className}`}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <span className="text-gray-500 text-sm font-medium">{text}</span>
    </div>
  );
};

export default ImagePlaceholder;
