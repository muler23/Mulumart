import React from 'react';
import toast from 'react-hot-toast';

const Toast = {
  success: (message, options = {}) => {
    return toast.success(message, {
      duration: 4000,
      position: 'top-right',
      ...options,
    });
  },

  error: (message, options = {}) => {
    return toast.error(message, {
      duration: 5000,
      position: 'top-right',
      ...options,
    });
  },

  info: (message, options = {}) => {
    return toast(message, {
      icon: 'ℹ️',
      duration: 4000,
      position: 'top-right',
      ...options,
    });
  },

  warning: (message, options = {}) => {
    return toast(message, {
      icon: '⚠️',
      duration: 4000,
      position: 'top-right',
      ...options,
    });
  },

  loading: (message, options = {}) => {
    return toast.loading(message, {
      position: 'top-right',
      ...options,
    });
  },

  dismiss: (toastId) => {
    toast.dismiss(toastId);
  },

  remove: () => {
    toast.remove();
  },
};

export default Toast;
