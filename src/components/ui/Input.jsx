import React from 'react';

export const Input = ({
  label,
  error,
  icon: Icon,
  type = 'text',
  placeholder,
  value,
  onChange,
  className = '',
  id,
  required = false,
  disabled = false
}) => {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative rounded-lg shadow-2xs">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={id}
          type={type}
          disabled={disabled}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full text-sm rounded-lg border bg-background text-foreground placeholder-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-ring/25 focus:border-primary transition-colors ${
            Icon ? 'pl-9 pr-3.5' : 'px-3.5'
          } py-2 ${
            error ? 'border-rose-500 focus:border-rose-500' : 'border-border'
          } ${className}`}
        />
      </div>
      {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
    </div>
  );
};

export const Select = ({ label, value, onChange, options = [], icon: Icon, id, className = '' }) => {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </label>
      )}
      <div className="relative rounded-lg shadow-2xs">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <select
          id={id}
          value={value}
          onChange={onChange}
          className={`w-full text-sm rounded-lg border bg-background text-foreground border-border focus:outline-hidden focus:ring-2 focus:ring-ring/25 focus:border-primary transition-colors ${
            Icon ? 'pl-9 pr-8' : 'px-3.5 pr-8'
          } py-2 appearance-none cursor-pointer ${className}`}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-background text-foreground">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-muted-foreground">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};
