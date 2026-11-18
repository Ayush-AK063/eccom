import jwt from "jsonwebtoken";
import User from "../models/User.js";

// remember = "Remember me" tick → 30 din, warna 1 din (browser band hone pe client bhi logout karta hai)
const generateRefreshToken = async (userId, remember = true) => {
  const token = await jwt.sign(
    { id: userId, rem: !!remember },
    process.env.JWT_SECRET_REFRESH_TOKEN,
    {
      expiresIn: remember ? "30d" : "1d",
    }
  );

  const updateRefreshToken = await User.updateOne(
    { _id: userId },
    {
      refreshToken: token,
    }
  );

  return token;
};

export default generateRefreshToken;
