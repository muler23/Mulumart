export const adValidationRules = {
  title: {
    required: 'Title is required',
    minLength: {
      value: 10,
      message: 'Title must be at least 10 characters',
    },
    maxLength: {
      value: 100,
      message: 'Title must be less than 100 characters',
    },
  },
  description: {
    required: 'Description is required',
    minLength: {
      value: 20,
      message: 'Description must be at least 20 characters',
    },
    maxLength: {
      value: 2000,
      message: 'Description must be less than 2000 characters',
    },
  },
  price: {
    required: 'Price is required',
    min: {
      value: 1,
      message: 'Price must be greater than 0',
    },
    max: {
      value: 1000000,
      message: 'Price must be less than 1,000,000',
    },
  },
  category: {
    required: 'Category is required',
  },
  condition: {
    required: 'Condition is required',
  },
  city: {
    required: 'City is required',
    minLength: {
      value: 2,
      message: 'City must be at least 2 characters',
    },
  },
};

export const userValidationRules = {
  name: {
    required: 'Name is required',
    minLength: {
      value: 2,
      message: 'Name must be at least 2 characters',
    },
    maxLength: {
      value: 50,
      message: 'Name must be less than 50 characters',
    },
  },
  email: {
    required: 'Email is required',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Invalid email address',
    },
  },
  phone: {
    required: 'Phone number is required',
    pattern: {
      value: /^[+]?[\d\s-()]+$/,
      message: 'Invalid phone number',
    },
    minLength: {
      value: 10,
      message: 'Phone number must be at least 10 digits',
    },
  },
  password: {
    required: 'Password is required',
    minLength: {
      value: 6,
      message: 'Password must be at least 6 characters',
    },
    validate: (value) => {
      const hasNumber = /\d/.test(value);
      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      
      if (!hasNumber) return 'Password must contain at least one number';
      if (!hasUpperCase) return 'Password must contain at least one uppercase letter';
      if (!hasLowerCase) return 'Password must contain at least one lowercase letter';
      
      return true;
    },
  },
  confirmPassword: {
    required: 'Please confirm your password',
    validate: (value, allValues) => {
      return value === allValues.password || 'Passwords do not match';
    },
  },
  bio: {
    maxLength: {
      value: 500,
      message: 'Bio must be less than 500 characters',
    },
  },
};

export const messageValidationRules = {
  message: {
    required: 'Message is required',
    minLength: {
      value: 1,
      message: 'Message cannot be empty',
    },
    maxLength: {
      value: 1000,
      message: 'Message must be less than 1000 characters',
    },
  },
};

export const validateImageFile = (file) => {
  const errors = [];
  
  // Check file size (5MB max)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    errors.push('File size must be less than 5MB');
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    errors.push('Only JPEG, PNG, and WebP images are allowed');
  }
  
  // Check image dimensions (if we can read them)
  return new Promise((resolve) => {
    if (errors.length > 0) {
      resolve(errors);
      return;
    }
    
    const img = new Image();
    img.onload = () => {
      // Minimum dimensions: 100x100, Maximum: 5000x5000
      if (img.width < 100 || img.height < 100) {
        errors.push('Image must be at least 100x100 pixels');
      }
      if (img.width > 5000 || img.height > 5000) {
        errors.push('Image must be less than 5000x5000 pixels');
      }
      resolve(errors);
    };
    
    img.onerror = () => {
      errors.push('Invalid image file');
      resolve(errors);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

export const validateSearchQuery = (query) => {
  const errors = [];
  
  if (query && query.length < 2) {
    errors.push('Search query must be at least 2 characters');
  }
  
  if (query && query.length > 100) {
    errors.push('Search query must be less than 100 characters');
  }
  
  return errors;
};

export const validatePriceRange = (min, max) => {
  const errors = [];
  
  if (min && max && parseFloat(min) > parseFloat(max)) {
    errors.push('Minimum price cannot be greater than maximum price');
  }
  
  if (min && parseFloat(min) < 0) {
    errors.push('Minimum price cannot be negative');
  }
  
  if (max && parseFloat(max) < 0) {
    errors.push('Maximum price cannot be negative');
  }
  
  return errors;
};
