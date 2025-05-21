import { forwardRef } from 'react';
import PropTypes from 'prop-types';

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'medium',
  type = 'button',
  className = '',
  disabled = false,
  loading = false,
  onClick,
  ...props
}, ref) => {
  // Base class
  let buttonClass = 'btn';
  
  // Add variant class
  buttonClass += ` btn-${variant}`;
  
  // Add size class
  buttonClass += ` btn-${size}`;
  
  // Add disabled class
  if (disabled || loading) {
    buttonClass += ' btn-disabled';
  }
  
  // Add custom class
  if (className) {
    buttonClass += ` ${className}`;
  }
  
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClass}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <div className="btn-loading-container">
          <div className="btn-spinner"></div>
          <span>{children}</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
});

Button.displayName = 'Button';

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'link']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  onClick: PropTypes.func,
};

export default Button;
