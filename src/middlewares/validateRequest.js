import {
  userRegistrationSchema,
  userLoginSchema,
  userUpdateSchema,
} from "../schemas/user.schema.js";

export const validateRegistration = (req, res, next) => {
  try {
    userRegistrationSchema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.errors,
    });
  }
};

export const validateLogin = (req, res, next) => {
  try {
    userLoginSchema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.errors,
    });
  }
};

export const validateUpdate = (req, res, next) => {
  try {
    userUpdateSchema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.errors,
    });
  }
};
