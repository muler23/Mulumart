import React from 'react';

const Card = ({
  children,
  className = '',
  padding = 'normal',
  shadow = 'normal',
  hover = false,
  rounded = 'normal',
  border = false,
  ...props
}) => {
  const baseClasses = 'bg-white';
  
  const paddings = {
    none: '',
    small: 'p-3',
    normal: 'p-6',
    large: 'p-8',
  };

  const shadows = {
    none: '',
    small: 'shadow-sm',
    normal: 'shadow-md',
    large: 'shadow-lg',
    xl: 'shadow-xl',
  };

  const roundeds = {
    none: '',
    small: 'rounded-sm',
    normal: 'rounded-lg',
    large: 'rounded-xl',
    full: 'rounded-full',
  };

  const borders = {
    none: '',
    normal: 'border border-gray-200',
    light: 'border border-gray-100',
  };

  const classes = [
    baseClasses,
    paddings[padding],
    shadows[shadow],
    roundeds[rounded],
    borders[border],
    hover ? 'hover:shadow-lg transition-shadow duration-300' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={`px-6 py-4 border-b border-gray-200 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardBody = ({ children, className = '', ...props }) => {
  return (
    <div className={`px-6 py-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div className={`px-6 py-4 border-t border-gray-200 ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
