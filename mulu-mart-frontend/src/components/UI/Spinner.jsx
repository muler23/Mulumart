import React from 'react';

const Spinner = ({
  size = 'md',
  color = 'primary',
  className = '',
  ...props
}) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  const colors = {
    primary: 'border-primary-600',
    white: 'border-white',
    gray: 'border-gray-300',
  };

  const classes = [
    'animate-spin rounded-full border-2 border-t-transparent',
    sizes[size],
    colors[color],
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      className="flex items-center justify-center"
      role="status"
      aria-label="Loading"
      {...props}
    >
      <div className={classes}></div>
    </div>
  );
};

export default Spinner;
