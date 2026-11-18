import jwt from "jsonwebtoken";
import User from "../models/User.js";

const auth = async (req, res, next) => {
  try {
    const token =
      // Header pehle — refresh ke baad client naya token bhejta hai, cookie purani ho sakti hai
      (req?.headers?.authorization?.split(" ")[1] !== "null" && req?.headers?.authorization?.split(" ")[1]) || req.cookies.accessToken;

    if (!token) {
      return res
        .status(401)
        .json({
          message: "Unauthorized",
          error: true,
          success: false
        });
    }
    const decoded = await jwt.verify(
      token,
      process.env.JWT_SECRET_ACCESS_TOKEN
    );

    if (!decoded) {
      return res
        .status(401)
        .json({ message: "Unauthorized", error: true, success: false });
    }

    // Suspended / inactive account → purana token bhi kaam na kare
    const user = await User.findById(decoded.id).select("status").lean();
    if (!user) {
      return res.status(401).json({ message: "Unauthorized", error: true, success: false });
    }
    if (user.status && user.status !== "active") {
      return res.status(403).json({ message: "Your account has been suspended. Please contact support.", error: true, success: false, suspended: true });
    }

    req.userId = decoded.id;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Unauthorized", error: true, success: false });
  }
};

export default auth;
