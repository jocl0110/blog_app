import rateLimit from "express-rate-limit";

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, //1 hour
  max: 5, //Limit each IP to 5 registration attemps per window
  message: {
    success: false,
    message: "Too many registration attemps. Please try again in an hour.",
    field: "rate_limit",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
