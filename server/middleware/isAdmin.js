import User from "../models/User.js";

// `auth` ke baad lagao: sirf role "admin" wale user aage ja sakte hain
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("role status");

    if (!user || user.role !== "admin") {
      return res.status(403).json({
        message: "Admin access only",
        error: true,
        success: false,
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: error.message, error: true, success: false });
  }
};

export default isAdmin;
