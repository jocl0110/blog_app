import { z } from "zod";

// Password validation regex
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const userRegistrationSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters long")
      .max(20, "Username must be at most 20 characters long")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username cannot contain spaces. Use only letters, numbers, and underscores"
      ),
    first_name: z
      .string()
      .min(2, "First name must be at least 2 characters long")
      .max(20, "First name must be at most 20 characters long")
      .regex(/^[a-zA-Z\s]+$/, "First name can only contain letters and spaces"),
    last_name: z
      .string()
      .min(2, "Last name must be at least 2 characters long")
      .max(36, "Last name must be at most 36 characters long")
      .regex(/^[a-zA-Z\s]+$/, "Last name can only contain letters and spaces"),
    profile_image: z
      .string()
      .url("Profile image must be a valid URL")
      .optional()
      .nullable(),
    email: z
      .string()
      .email("Invalid email address")
      .max(100, "Email must be at most 100 characters long"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(
        passwordRegex,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Schema for user login
export const userLoginSchema = z.object({
  username: z
    .string({
      required_error: "Username is required",
      invalid_type_error: "Username must be a string",
    })
    .min(3, "Username must be at least 3 characters long")
    .max(20, "Username must be at most 20 characters long")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username cannot contain spaces. Use only letters, numbers, and underscores"
    )
    .trim(),
  password: z
    .string({
      required_error: "Password is required",
      invalid_type_error: "Password must be a string",
    })
    .min(1, "Password cannot be empty")
    .max(100, "Password is too long"),
});

// Schema for user update
export const userUpdateSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters long")
      .max(20, "Username must be at most 20 characters long")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
      )
      .optional(),

    email: z
      .string()
      .email("Invalid email address")
      .max(100, "Email must be at most 100 characters long")
      .optional(),

    currentPassword: z.string().min(1, "Current password is required"),

    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(
        passwordRegex,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      )
      .optional(),
  })
  .refine(
    (data) => {
      if (data.newPassword) {
        return data.newPassword !== data.currentPassword;
      }
      return true;
    },
    {
      message: "New password must be different from current password",
      path: ["newPassword"],
    }
  );
