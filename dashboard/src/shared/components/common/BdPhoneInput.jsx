import React, { useState, useEffect, useRef } from 'react';
import { Phone, CheckCircle2, AlertCircle } from 'lucide-react';

const VALID_OPERATOR_PREFIXES = ['13', '14', '15', '16', '17', '18', '19'];

/**
 * BdPhoneInput - Bangladeshi Phone Number Input with fixed +880 prefix,
 * automatic leading 0 trimming after 1s inactivity, and 013-019 operator validation.
 */
export function BdPhoneInput({
  value = '',
  onChange,
  required = false,
  className = '',
  disabled = false,
  id,
  name
}) {
  // Extract the local digits part from full number (+88017... or 017... or 17...)
  const extractLocalDigits = (val) => {
    if (!val) return '';
    let digits = String(val).replace(/\D/g, '');
    if (digits.startsWith('880')) {
      digits = digits.slice(3);
    }
    return digits;
  };

  const [inputVal, setInputVal] = useState(() => extractLocalDigits(value));
  const timerRef = useRef(null);

  // Synchronize when value from props changes externally
  useEffect(() => {
    const extracted = extractLocalDigits(value);
    // Only update internal state if it represents a different number of digits
    if (extractLocalDigits(inputVal) !== extracted && !inputVal.startsWith('0')) {
      setInputVal(extracted);
    }
  }, [value]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const triggerParentChange = (digits) => {
    if (!digits) {
      onChange && onChange('');
      return;
    }
    // Normalize: if it starts with 0, trim it for canonical storage
    const clean = digits.startsWith('0') ? digits.slice(1) : digits;
    onChange && onChange(`+880${clean}`);
  };

  const handleInputChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '');

    // Max 11 digits if starting with 0, or max 10 digits if starting with 1
    if (raw.startsWith('0')) {
      raw = raw.slice(0, 11);
    } else {
      raw = raw.slice(0, 10);
    }

    setInputVal(raw);

    // Clear any previous debounce timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // If starts with 0, schedule auto-trim after 1 second of inactivity
    if (raw.startsWith('0')) {
      timerRef.current = setTimeout(() => {
        const trimmed = raw.slice(1);
        setInputVal(trimmed);
        triggerParentChange(trimmed);
      }, 1000);
    }

    triggerParentChange(raw);
  };

  const handleBlur = () => {
    // If blurred while still having leading 0, trim immediately
    if (inputVal.startsWith('0')) {
      if (timerRef.current) clearTimeout(timerRef.current);
      const trimmed = inputVal.slice(1);
      setInputVal(trimmed);
      triggerParentChange(trimmed);
    }
  };

  // Validation checks
  const effectiveDigits = inputVal.startsWith('0') ? inputVal.slice(1) : inputVal;
  const operatorPrefix = effectiveDigits.slice(0, 2);
  const isOperatorValid = effectiveDigits.length < 2 || VALID_OPERATOR_PREFIXES.includes(operatorPrefix);
  const isComplete = effectiveDigits.length === 10 && VALID_OPERATOR_PREFIXES.includes(operatorPrefix);
  const hasError = effectiveDigits.length >= 2 && !VALID_OPERATOR_PREFIXES.includes(operatorPrefix);

  return (
    <div className="w-full space-y-1">
      <div
        className={`flex items-center rounded-md border transition-all overflow-hidden bg-background ${
          hasError
            ? 'border-rose-500 ring-1 ring-rose-500'
            : isComplete
            ? 'border-emerald-500/60 focus-within:ring-1 focus-within:ring-emerald-500'
            : 'border-border focus-within:ring-1 focus-within:ring-primary'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
      >
        {/* Fixed Non-deletable +880 Prefix */}
        <div className="flex items-center gap-1.5 px-2.5 py-2 bg-muted/60 border-r border-border text-foreground font-mono font-bold text-xs select-none shrink-0">
          <span className="text-base leading-none">🇧🇩</span>
          <span>+880</span>
        </div>

        {/* Input for remaining digits */}
        <input
          type="tel"
          id={id}
          name={name}
          disabled={disabled}
          required={required}
          value={inputVal}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className="flex-1 px-3 py-2 bg-transparent text-foreground text-xs font-mono font-bold outline-none placeholder:text-muted-foreground/40"
        />

        {/* Status Indicator Icon */}
        <div className="px-2.5 shrink-0 flex items-center">
          {isComplete ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          ) : hasError ? (
            <AlertCircle className="w-4 h-4 text-rose-500" />
          ) : (
            <Phone className="w-3.5 h-3.5 text-muted-foreground/40" />
          )}
        </div>
      </div>

      {/* Operator Validation Error message */}
      {hasError && (
        <p className="text-[11px] text-rose-500 font-medium">
          Invalid operator code! Only 013-019 are allowed.
        </p>
      )}
      {inputVal.startsWith('0') && !hasError && (
        <p className="text-[10px] text-muted-foreground animate-pulse">
          Leading 0 will be automatically adjusted...
        </p>
      )}
    </div>
  );
}
