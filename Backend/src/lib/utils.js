import jwt from "jsonwebtoken";
import 'dotenv/config';

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
  maxAge: 7 * 24 * 60 * 60 * 1000, // MS
  httpOnly: true,
  sameSite: "none", // Crucial change for cross-origin AJAX
  secure: true, // MUST be true if sameSite is "none"
});

  return token;
};