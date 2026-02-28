import * as yup from "yup";

export const userRegistrationSchema = yup.object({
  fullName: yup
    .string()
    .required("Full name is required")
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be less than 100 characters")
    .matches(/^[a-zA-Z\s]+$/, "Full name can only contain letters and spaces"),
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address"),
  mobileNumber: yup
    .string()
    .required("Mobile number is required")
    .matches(/^[+]?\d[\d\s\-()]{8,14}$/, "Please enter a valid mobile number"),
  role: yup
    .string<"user" | "helper">()
    .oneOf(["user", "helper"])
    .required("Please select a role"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must include uppercase, lowercase and number",
    ),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords must match"),
});

export const existingUserSchema = yup.object({
  fullName: yup
    .string()
    .required("Full name is required")
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be less than 100 characters")
    .matches(/^[a-zA-Z\s]+$/, "Full name can only contain letters and spaces"),
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address"),
  mobileNumber: yup
    .string()
    .required("Mobile number is required")
    .matches(/^[+]?\d[\d\s\-()]{8,14}$/, "Please enter a valid mobile number"),
  role: yup
    .string<"user" | "helper">()
    .oneOf(["user", "helper"])
    .required("Please select a role"),
});

export const loginSchema = yup.object({
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address"),
  password: yup
    .string()
    .required("Password is required"),
});

export const validateField = async (
  schema: yup.AnyObjectSchema,
  field: string,
  value: unknown,
  context: Record<string, unknown> = {},
) => {
  try {
    await schema.validateAt(field, { [field]: value, ...context });
    return null;
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return error.message;
    }
    return "Validation error";
  }
};

export const validateForm = async (
  schema: yup.AnyObjectSchema,
  data: Record<string, unknown>,
) => {
  try {
    await schema.validate(data, { abortEarly: false });
    return {} as Record<string, string>;
  } catch (error) {
    if (error instanceof yup.ValidationError) {
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

export type UserRegistrationData = yup.InferType<typeof userRegistrationSchema>;
export type ExistingUserData = yup.InferType<typeof existingUserSchema>;
export type LoginData = yup.InferType<typeof loginSchema>;
