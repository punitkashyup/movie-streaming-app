import React, { useState, useEffect } from 'react';

const FormInput = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  minLength,
  pattern,
  validate,
  errorMessage,
  hint,
  icon,
  className = '',
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const [valid, setValid] = useState(null);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  // Validate input when value changes or when focused changes
  useEffect(() => {
    if (!touched) return;
    
    // Skip validation if the field is empty and not required
    if (!value && !required) {
      setValid(null);
      setError('');
      return;
    }

    // Custom validation function
    if (validate) {
      const result = validate(value);
      setValid(result.valid);
      setError(result.valid ? '' : (result.message || errorMessage));
      return;
    }

    // Built-in validation
    let isValid = true;
    let message = '';

    if (required && !value) {
      isValid = false;
      message = 'This field is required';
    } else if (minLength && value.length < minLength) {
      isValid = false;
      message = `Must be at least ${minLength} characters`;
    } else if (pattern && !new RegExp(pattern).test(value)) {
      isValid = false;
      message = errorMessage || 'Invalid format';
    } else if (type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      isValid = false;
      message = 'Please enter a valid email address';
    } else if (type === 'password' && value && value.length < 8) {
      isValid = false;
      message = 'Password must be at least 8 characters long';
    }

    setValid(isValid);
    setError(message);
  }, [value, focused, required, minLength, pattern, type, errorMessage, validate, touched]);

  const handleFocus = () => {
    setFocused(true);
    setTouched(true);
  };

  const handleBlur = () => {
    setFocused(false);
  };

  // Determine input group class based on validation state
  const getInputGroupClass = () => {
    let classes = 'auth-input-group';
    
    if (className) {
      classes += ` ${className}`;
    }
    
    if (valid === true) {
      classes += ' valid';
    } else if (valid === false) {
      classes += ' invalid';
    }
    
    return classes;
  };

  // Render validation icon based on state
  const renderIcon = () => {
    if (valid === true) {
      return (
        <svg className="auth-input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      );
    } else if (valid === false) {
      return (
        <svg className="auth-input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      );
    } else if (icon) {
      return icon;
    }
    
    return null;
  };

  return (
    <div className={getInputGroupClass()}>
      <label htmlFor={id}>{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="auth-input"
          placeholder={placeholder}
          required={required}
          {...props}
        />
        {renderIcon()}
      </div>
      {error && <div className="auth-input-error">{error}</div>}
      {hint && !error && <div className="auth-input-hint">{hint}</div>}
    </div>
  );
};

export default FormInput;
