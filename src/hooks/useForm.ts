import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Validation rule function type
 * Returns error message string if validation fails, undefined/null if valid
 */
export type ValidationRule<T> = (value: T[keyof T], formData: T) => string | undefined | null;

/**
 * Validation rules configuration
 * Maps field names to validation rules
 */
export type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T> | ValidationRule<T>[];
};

/**
 * Options for the useForm hook
 */
export interface UseFormOptions<T> {
  /** Initial form values */
  initialValues: T;
  /** Validation rules for each field */
  validationRules?: ValidationRules<T>;
  /** Callback when form is submitted successfully */
  onSubmit?: (values: T) => void | Promise<void>;
  /** Whether to validate on change (default: true) */
  validateOnChange?: boolean;
  /** Whether to validate on blur (default: false) */
  validateOnBlur?: boolean;
  /** Custom error messages */
  errorMessages?: Partial<Record<keyof T, string>>;
}

/**
 * Return type of useForm hook
 */
export interface UseFormReturn<T> {
  /** Current form values */
  values: T;
  /** Form errors */
  errors: Partial<Record<keyof T, string>>;
  /** Whether form is currently being submitted */
  isSubmitting: boolean;
  /** Whether form has been touched (any field modified) */
  touched: Partial<Record<keyof T, boolean>>;
  /** Whether form is valid */
  isValid: boolean;
  /** Set a field value */
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  /** Set multiple field values */
  setValues: (values: Partial<T>) => void;
  /** Get a field value */
  getValue: <K extends keyof T>(field: K) => T[K];
  /** Set a field error */
  setError: <K extends keyof T>(field: K, error: string | undefined) => void;
  /** Set multiple field errors */
  setErrors: (errors: Partial<Record<keyof T, string>>) => void;
  /** Clear a field error */
  clearError: <K extends keyof T>(field: K) => void;
  /** Clear all errors */
  clearErrors: () => void;
  /** Mark a field as touched */
  setTouched: <K extends keyof T>(field: K, touched?: boolean) => void;
  /** Handle field change */
  handleChange: <K extends keyof T>(field: K) => (value: T[K]) => void;
  /** Handle field blur */
  handleBlur: <K extends keyof T>(field: K) => () => void;
  /** Validate a single field */
  validateField: <K extends keyof T>(field: K) => string | undefined;
  /** Validate all fields */
  validate: () => boolean;
  /** Reset form to initial values */
  reset: () => void;
  /** Reset form to new initial values */
  resetTo: (newInitialValues: T) => void;
  /** Submit form */
  handleSubmit: (e?: React.FormEvent) => Promise<void> | void;
  /** Get field props for MUI TextField */
  getFieldProps: <K extends keyof T>(
    field: K
  ) => {
    value: T[K];
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
    error: boolean;
    helperText: string | undefined;
  };
}

/**
 * Built-in validation rules
 */
export const validators = {
  required: <T,>(message?: string): ValidationRule<T> => {
    return (value) => {
      if (value === undefined || value === null || value === '') {
        return message || 'errors.required';
      }
      if (typeof value === 'string' && !value.trim()) {
        return message || 'errors.required';
      }
      if (Array.isArray(value) && value.length === 0) {
        return message || 'errors.required';
      }
      return undefined;
    };
  },

  email: <T,>(message?: string): ValidationRule<T> => {
    return (value) => {
      if (!value || typeof value !== 'string') return undefined;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return message || 'errors.invalidEmail';
      }
      return undefined;
    };
  },

  minLength: <T,>(min: number, message?: string): ValidationRule<T> => {
    return (value) => {
      if (!value || typeof value !== 'string') return undefined;
      if (value.length < min) {
        return message || `errors.minLength`;
      }
      return undefined;
    };
  },

  maxLength: <T,>(max: number, message?: string): ValidationRule<T> => {
    return (value) => {
      if (!value || typeof value !== 'string') return undefined;
      if (value.length > max) {
        return message || `errors.maxLength`;
      }
      return undefined;
    };
  },

  pattern: <T,>(regex: RegExp, message?: string): ValidationRule<T> => {
    return (value) => {
      if (!value || typeof value !== 'string') return undefined;
      if (!regex.test(value)) {
        return message || 'errors.invalidFormat';
      }
      return undefined;
    };
  },

  custom: <T,>(validator: (value: T[keyof T], formData: T) => boolean, message: string): ValidationRule<T> => {
    return (value, formData) => {
      return validator(value, formData) ? undefined : message;
    };
  },
};

/**
 * Generic form state and validation hook
 * 
 * @example
 * ```tsx
 * const form = useForm({
 *   initialValues: { name: '', email: '' },
 *   validationRules: {
 *     name: [validators.required()],
 *     email: [validators.required(), validators.email()],
 *   },
 *   onSubmit: async (values) => {
 *     await saveMember(values);
 *   },
 * });
 * 
 * <TextField {...form.getFieldProps('name')} />
 * <TextField {...form.getFieldProps('email')} />
 * <Button onClick={form.handleSubmit}>Submit</Button>
 * ```
 */
export function useForm<T extends Record<string, any>>(
  options: UseFormOptions<T>
): UseFormReturn<T> {
  const { t } = useTranslation();
  const {
    initialValues,
    validationRules = {},
    onSubmit,
    validateOnChange = true,
    validateOnBlur = false,
  } = options;

  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initialValuesRef = useRef(initialValues);

  // Update initial values ref when it changes
  useEffect(() => {
    initialValuesRef.current = initialValues;
  }, [initialValues]);

  // Validate a single field
  const validateField = useCallback(
    <K extends keyof T>(field: K): string | undefined => {
      const value = values[field];
      const rules = validationRules[field];

      if (!rules) return undefined;

      const rulesArray = Array.isArray(rules) ? rules : [rules];

      for (const rule of rulesArray) {
        const error = rule(value, values);
        if (error) {
          // Translate error message if it's a translation key
          const translatedError = error.startsWith('errors.') ? t(error) : error;
          return translatedError;
        }
      }

      return undefined;
    },
    [values, validationRules, t]
  );

  // Validate all fields
  const validate = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};

    (Object.keys(validationRules) as Array<keyof T>).forEach((field) => {
      const error = validateField(field);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [validationRules, validateField]);

  // Set a single field value
  const setValue = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setValues((prev) => ({ ...prev, [field]: value }));
      
      // Clear error when field changes
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }

      // Validate on change if enabled
      if (validateOnChange) {
        const error = validateField(field);
        if (error) {
          setErrors((prev) => ({ ...prev, [field]: error }));
        }
      }
    },
    [errors, validateOnChange, validateField]
  );

  // Set multiple field values
  const setValuesMultiple = useCallback((newValues: Partial<T>) => {
    setValues((prev) => ({ ...prev, ...newValues }));
  }, []);

  // Get a field value
  const getValue = useCallback(
    <K extends keyof T>(field: K): T[K] => {
      return values[field];
    },
    [values]
  );

  // Set a field error
  const setError = useCallback(<K extends keyof T>(field: K, error: string | undefined) => {
    setErrors((prev) => {
      if (error === undefined) {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      }
      return { ...prev, [field]: error };
    });
  }, []);

  // Set multiple field errors
  const setErrorsMultiple = useCallback((newErrors: Partial<Record<keyof T, string>>) => {
    setErrors(newErrors);
  }, []);

  // Clear a field error
  const clearError = useCallback(<K extends keyof T>(field: K) => {
    setError(field, undefined);
  }, [setError]);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Mark a field as touched
  const setTouchedField = useCallback(<K extends keyof T>(field: K, isTouched = true) => {
    setTouched((prev) => ({ ...prev, [field]: isTouched }));
  }, []);

  // Handle field change
  const handleChange = useCallback(
    <K extends keyof T>(field: K) => {
      return (value: T[K]) => {
        setValue(field, value);
        setTouchedField(field, true);
      };
    },
    [setValue, setTouchedField]
  );

  // Handle field blur
  const handleBlur = useCallback(
    <K extends keyof T>(field: K) => {
      return () => {
        setTouchedField(field, true);
        if (validateOnBlur) {
          const error = validateField(field);
          if (error) {
            setError(field, error);
          }
        }
      };
    },
    [setTouchedField, validateOnBlur, validateField, setError]
  );

  // Reset form to initial values
  const reset = useCallback(() => {
    setValues(initialValuesRef.current);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, []);

  // Reset form to new initial values
  const resetTo = useCallback((newInitialValues: T) => {
    initialValuesRef.current = newInitialValues;
    setValues(newInitialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, []);

  // Submit form
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();

      // Mark all fields as touched
      const allFields = Object.keys(validationRules) as Array<keyof T>;
      allFields.forEach((field) => setTouchedField(field, true));

      // Validate
      if (!validate()) {
        return;
      }

      if (onSubmit) {
        setIsSubmitting(true);
        try {
          await onSubmit(values);
        } catch (error) {
          console.error('Form submission error:', error);
        } finally {
          setIsSubmitting(false);
        }
      }
    },
    [values, validationRules, validate, onSubmit, setTouchedField]
  );

  // Get field props for MUI TextField
  const getFieldProps = useCallback(
    <K extends keyof T>(field: K) => {
      return {
        value: values[field] as string,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
          handleChange(field)(e.target.value as T[K]);
        },
        onBlur: handleBlur(field),
        error: !!errors[field],
        helperText: errors[field],
      };
    },
    [values, errors, handleChange, handleBlur]
  );

  // Check if form is valid
  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    isSubmitting,
    touched,
    isValid,
    setValue,
    setValues: setValuesMultiple,
    getValue,
    setError,
    setErrors: setErrorsMultiple,
    clearError,
    clearErrors,
    setTouched: setTouchedField,
    handleChange,
    handleBlur,
    validateField,
    validate,
    reset,
    resetTo,
    handleSubmit,
    getFieldProps,
  };
}
