export type ValidationContext = Record<string, unknown>;

type ValidationRule = (
  value: unknown,
  data: ValidationContext,
) => string | null;

type SchemaFieldRules = Record<string, ValidationRule[]>;

type ValidateOptions = {
  abortEarly?: boolean;
};

type ValidationErrorItem = {
  path?: string;
  message: string;
};

class SchemaValidationError extends Error {
  path?: string;
  inner: ValidationErrorItem[];

  constructor(message: string, inner: ValidationErrorItem[], path?: string) {
    super(message);
    this.name = "ValidationError";
    this.path = path;
    this.inner = inner;
  }
}

export type AnyObjectSchema = {
  validateAt: (field: string, data: ValidationContext) => Promise<void>;
  validate: (data: ValidationContext, options?: ValidateOptions) => Promise<void>;
};

const required = (label: string): ValidationRule => (value) => {
  if (typeof value === "string" && value.trim().length > 0) {
    return null;
  }

  return `${label} is required`;
};

const minLength = (label: string, min: number): ValidationRule => (value) => {
  if (typeof value !== "string") {
    return null;
  }

  return value.trim().length >= min
    ? null
    : `${label} must be at least ${min} characters`;
};

const maxLength = (label: string, max: number): ValidationRule => (value) => {
  if (typeof value !== "string") {
    return null;
  }

  return value.trim().length <= max
    ? null
    : `${label} must be less than ${max} characters`;
};

const matches = (regex: RegExp, message: string): ValidationRule => (value) => {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  return regex.test(value.trim()) ? null : message;
};

const validEmail: ValidationRule = (value) => {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
    ? null
    : "Please enter a valid email address";
};

const oneOf = (allowedValues: readonly string[], message: string): ValidationRule => (value) => {
  if (typeof value !== "string") {
    return message;
  }

  return allowedValues.includes(value) ? null : message;
};

const sameAs = (otherField: string, message: string): ValidationRule => (
  value,
  data,
) => {
  return value === data[otherField] ? null : message;
};

const createSchema = (fields: SchemaFieldRules): AnyObjectSchema => ({
  async validateAt(field, data) {
    const rules = fields[field] || [];

    for (const rule of rules) {
      const message = rule(data[field], data);
      if (message) {
        throw new SchemaValidationError(message, [{ path: field, message }], field);
      }
    }
  },

  async validate(data, options = {}) {
    const abortEarly = options.abortEarly ?? true;
    const errors: ValidationErrorItem[] = [];

    for (const [field, rules] of Object.entries(fields)) {
      for (const rule of rules) {
        const message = rule(data[field], data);
        if (!message) {
          continue;
        }

        errors.push({ path: field, message });

        if (abortEarly) {
          throw new SchemaValidationError(message, errors, field);
        }

        break;
      }
    }

    if (errors.length > 0) {
      throw new SchemaValidationError(errors[0].message, errors, errors[0].path);
    }
  },
});

export const userRegistrationSchema = createSchema({
  fullName: [
    required("Full name"),
    minLength("Full name", 2),
    maxLength("Full name", 100),
    matches(/^[a-zA-Z\s]+$/, "Full name can only contain letters and spaces"),
  ],
  email: [required("Email"), validEmail],
  mobileNumber: [
    required("Mobile number"),
    matches(/^[+]?\d[\d\s\-()]{8,14}$/, "Please enter a valid mobile number"),
  ],
  role: [required("Role"), oneOf(["user", "helper"], "Please select a role")],
  password: [
    required("Password"),
    minLength("Password", 8),
    matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must include uppercase, lowercase and number",
    ),
  ],
  confirmPassword: [
    required("Confirm password"),
    sameAs("password", "Passwords must match"),
  ],
});

export const existingUserSchema = createSchema({
  fullName: [
    required("Full name"),
    minLength("Full name", 2),
    maxLength("Full name", 100),
    matches(/^[a-zA-Z\s]+$/, "Full name can only contain letters and spaces"),
  ],
  email: [required("Email"), validEmail],
  mobileNumber: [
    required("Mobile number"),
    matches(/^[+]?\d[\d\s\-()]{8,14}$/, "Please enter a valid mobile number"),
  ],
  role: [required("Role"), oneOf(["user", "helper"], "Please select a role")],
});

export const loginSchema = createSchema({
  email: [required("Email"), validEmail],
  password: [required("Password")],
});

export const validateField = async (
  schema: AnyObjectSchema,
  field: string,
  value: unknown,
  context: ValidationContext = {},
) => {
  try {
    await schema.validateAt(field, { [field]: value, ...context });
    return null;
  } catch (error) {
    if (error instanceof SchemaValidationError) {
      return error.message;
    }

    return "Validation error";
  }
};

export const validateForm = async (
  schema: AnyObjectSchema,
  data: ValidationContext,
) => {
  try {
    await schema.validate(data, { abortEarly: false });
    return {} as Record<string, string>;
  } catch (error) {
    if (error instanceof SchemaValidationError) {
      const errors: Record<string, string> = {};
      for (const item of error.inner) {
        if (item.path && !errors[item.path]) {
          errors[item.path] = item.message;
        }
      }
      return errors;
    }

    return { form: "Validation error" };
  }
};

export type UserRegistrationData = {
  fullName: string;
  email: string;
  mobileNumber: string;
  role: "user" | "helper";
  password: string;
  confirmPassword: string;
};

export type ExistingUserData = {
  fullName: string;
  email: string;
  mobileNumber: string;
  role: "user" | "helper";
};

export type LoginData = {
  email: string;
  password: string;
};
