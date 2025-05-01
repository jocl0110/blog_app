import bcrypt from "bcryptjs";

export const hashPassword = async function (key) {
  const value = await bcrypt.hash(key, 10);
  return value;
};
