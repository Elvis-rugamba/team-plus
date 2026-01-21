/**
 * useForm Hook Usage Examples
 * 
 * This file demonstrates how to use the useForm hook in various scenarios.
 * These are examples only and not meant to be executed.
 */

import { useForm, validators } from './useForm';

// ============================================================================
// Example 1: Simple Form with Required Fields
// ============================================================================

interface SimpleFormData {
  name: string;
  email: string;
}

function SimpleFormExample() {
  const form = useForm<SimpleFormData>({
    initialValues: {
      name: '',
      email: '',
    },
    validationRules: {
      name: [validators.required()],
      email: [validators.required(), validators.email()],
    },
    onSubmit: async (values) => {
      console.log('Submitting:', values);
      // await saveData(values);
    },
  });

  return (
    <form onSubmit={form.handleSubmit}>
      <input
        {...form.getFieldProps('name')}
        placeholder="Name"
      />
      <input
        {...form.getFieldProps('email')}
        type="email"
        placeholder="Email"
      />
      <button type="submit" disabled={form.isSubmitting}>
        Submit
      </button>
    </form>
  );
}

// ============================================================================
// Example 2: Form with Custom Validation
// ============================================================================

interface CustomFormData {
  password: string;
  confirmPassword: string;
}

function CustomValidationExample() {
  const form = useForm<CustomFormData>({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validationRules: {
      password: [
        validators.required(),
        validators.minLength(8, 'Password must be at least 8 characters'),
      ],
      confirmPassword: [
        validators.required(),
        validators.custom(
          (value, formData) => value === formData.password,
          'Passwords do not match'
        ),
      ],
    },
    onSubmit: async (values) => {
      console.log('Submitting:', values);
    },
  });

  return (
    <form onSubmit={form.handleSubmit}>
      <input
        {...form.getFieldProps('password')}
        type="password"
        placeholder="Password"
      />
      <input
        {...form.getFieldProps('confirmPassword')}
        type="password"
        placeholder="Confirm Password"
      />
      <button type="submit">Submit</button>
    </form>
  );
}

// ============================================================================
// Example 3: Form with Manual Field Handling (for complex inputs)
// ============================================================================

interface ComplexFormData {
  name: string;
  role: string;
  skills: string[];
  availability: 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE';
}

function ComplexFormExample() {
  const form = useForm<ComplexFormData>({
    initialValues: {
      name: '',
      role: '',
      skills: [],
      availability: 'AVAILABLE',
    },
    validationRules: {
      name: [validators.required()],
      role: [validators.required()],
      skills: [validators.custom(
        (value) => Array.isArray(value) && value.length > 0,
        'At least one skill is required'
      )],
    },
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      console.log('Submitting:', values);
    },
  });

  return (
    <form onSubmit={form.handleSubmit}>
      {/* Using getFieldProps for simple text input */}
      <input
        {...form.getFieldProps('name')}
        placeholder="Name"
      />

      {/* Using handleChange for custom components */}
      <select
        value={form.values.role}
        onChange={(e) => form.handleChange('role')(e.target.value)}
        onBlur={form.handleBlur('role')}
      >
        <option value="">Select Role</option>
        <option value="Developer">Developer</option>
        <option value="Designer">Designer</option>
      </select>
      {form.errors.role && <span>{form.errors.role}</span>}

      {/* Using setValue for complex updates */}
      <button
        type="button"
        onClick={() => {
          const currentSkills = form.values.skills;
          form.setValue('skills', [...currentSkills, 'New Skill']);
        }}
      >
        Add Skill
      </button>

      <button type="submit" disabled={!form.isValid || form.isSubmitting}>
        Submit
      </button>
    </form>
  );
}

// ============================================================================
// Example 4: Form with Reset Functionality
// ============================================================================

function ResetExample() {
  const form = useForm({
    initialValues: { name: '', email: '' },
    validationRules: {
      name: [validators.required()],
      email: [validators.required(), validators.email()],
    },
  });

  // Reset to initial values
  const handleReset = () => {
    form.reset();
  };

  // Reset to new values (e.g., when editing)
  const handleEdit = (data: { name: string; email: string }) => {
    form.resetTo(data);
  };

  return (
    <form onSubmit={form.handleSubmit}>
      <input {...form.getFieldProps('name')} />
      <input {...form.getFieldProps('email')} />
      <button type="submit">Submit</button>
      <button type="button" onClick={handleReset}>
        Reset
      </button>
    </form>
  );
}

// ============================================================================
// Example 5: Form with Conditional Validation
// ============================================================================

interface ConditionalFormData {
  hasEmail: boolean;
  email: string;
}

function ConditionalValidationExample() {
  const form = useForm<ConditionalFormData>({
    initialValues: {
      hasEmail: false,
      email: '',
    },
    validationRules: {
      email: [
        validators.custom(
          (value, formData) => {
            // Only validate email if hasEmail is true
            if (!formData.hasEmail) return true;
            return validators.email()(value, formData) === undefined;
          },
          'Please enter a valid email'
        ),
      ],
    },
  });

  return (
    <form onSubmit={form.handleSubmit}>
      <label>
        <input
          type="checkbox"
          checked={form.values.hasEmail}
          onChange={(e) => form.setValue('hasEmail', e.target.checked)}
        />
        Has Email
      </label>
      {form.values.hasEmail && (
        <input
          {...form.getFieldProps('email')}
          type="email"
          placeholder="Email"
        />
      )}
      <button type="submit">Submit</button>
    </form>
  );
}
