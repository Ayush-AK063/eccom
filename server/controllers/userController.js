import crypto from "crypto";
import { logActivity } from "../utils/activity.js";
import Order from "../models/Order.js";
import CartProduct from "../models/CartProduct.js";
import Address from "../models/Address.js";
import MyList from "../models/MyList.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmailFun from "../config/sendEmail.js";
import VerificationEmail from "../utils/verifyEmailTemplate.js";
import generateAccessToken from "../utils/generateAccessToken.js";
import generateRefreshToken from "../utils/generateRefreshToken.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import admin from "firebase-admin";

// Initialise Firebase Admin SDK once (guard against hot-reload double-init)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Replace literal \n in the env string with real newlines
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const registerUserController = async (req, res) => {
  try {
    let user;

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
        error: true,
        success: false,
      });
    }

    user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ message: "User already exists", error: true, success: false });
    }

    const verifycode = Math.floor(100000 + Math.random() * 900000).toString();

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashPassword,
      hasPassword: true,
      otp: verifycode,
      otp_expires: Date.now() + 10 * 60 * 1000,
    });

    await user.save();
    logActivity(user._id, "signup", { method: "email" }, req);

    // Correct usage: pass arguments, not an object
    await sendEmailFun(
      email,
      "Verify your email",
      "",
      VerificationEmail(name, verifycode)
    );

    const token = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JWT_SECRET
    );

    return res.status(200).json({
      success: true,
      error: false,
      message:
        "User registered successfully. Please check your email to verify your account.",
      token,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, error: true, success: false });
  }
};

export const verifyEmailController = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ message: "User Not Found!", error: true, success: false });
    }

    const isCodeValid = user.otp === otp;
    const isNotExpired = user.otp_expires > Date.now();

    if (isCodeValid && isNotExpired) {
      user.verify_email = true;
      user.otp = null;
      user.otp_expires = null;
      await user.save();
      return res.status(200).json({
        message: "Email verified successfully",
        success: true,
        error: false,
      });
    } else if (!isCodeValid) {
      return res
        .status(400)
        .json({ message: "Invalid OTP", error: true, success: false });
    } else {
      return res
        .status(400)
        .json({ message: "OTP Expired", error: true, success: false });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, error: true, success: false });
  }
};

export const loginUserController = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ message: "User Not Found!", error: true, success: false });
    }

    if (user.status !== "active") {
      return res.status(400).json({
        message: `Your account is ${user.status}. Please contact support.`,
        error: true,
        success: false,
      });
    }

    if (user.verify_email !== true) {
      return res.status(400).json({
        message: `Your email is not verified. Please verify your email to login.`,
        error: true,
        success: false,
      });
    }

    // Google se bana account jiska password set nahi hai
    if (!user.password) {
      return res.status(400).json({
        message: "This account uses Google login. Please continue with Google.",
        error: true,
        success: false,
      });
    }

    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
      return res
        .status(400)
        .json({ message: "Invalid Credentials", error: true, success: false });
    }

    // Admin panel se login: sirf admin role (token issue hone se pehle hi rok do)
    if (req.body.adminLogin === true && user.role !== "admin") {
      return res.status(403).json({
        message: "Admin access only",
        error: true,
        success: false,
      });
    }

    const accessToken = await generateAccessToken(user._id);
    const refreshToken = await generateRefreshToken(user._id, req.body.remember !== false);

    await User.findByIdAndUpdate(user?._id, {
      last_login_date: Date.now(),
    });
    logActivity(user?._id, "login", { method: "email" }, req);

    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };
    res.cookie("accessToken", accessToken, cookiesOption);
    res.cookie("refreshToken", refreshToken, cookiesOption);

    return res.status(200).json({
      message: "Login Successful",
      success: true,
      error: false,
      data: {
        accessToken,
        refreshToken,
        user: await User.findById(user._id).select("-password -refreshToken -otp -otp_expires"),
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, error: true, success: false });
  }
};

export const logoutUserController = async (req, res) => {
  try {
    const userid = req.userId;

    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };
    res.clearCookie("accessToken", cookiesOption);
    res.clearCookie("refreshToken", cookiesOption);

    await User.findByIdAndUpdate(userid, {
      refreshToken: "",
    });

    return res
      .status(200)
      .json({ message: "Logout Successful", success: true, error: false });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, error: true, success: false });
  }
};

var imagesArr = [];
export const userAvatarController = async (req, res) => {
  try {
    imagesArr = [];

    const userid = req.userId;
    const image = req.files;

    const user = await User.findOne({ _id: userid });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", error: true, success: false });
    }

    //first remove existing image from cloudinary
    const imgUrl = user?.avatar;
    const urlArr = imgUrl.split("/");
    const avatar_image = urlArr[urlArr.length - 1];
    const imageName = avatar_image.split(".")[0];

    if (imageName) {
      const result = await cloudinary.uploader.destroy(
        imageName,
        function (error, result) {
          //console.log(result, error);
        }
      );
    }

    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: false,
    };

    for (let i = 0; i < req?.files?.length; i++) {
      // Use promise style, not callback
      const result = await cloudinary.uploader.upload(
        req?.files[i]?.path,
        options
      );
      imagesArr.push(result.secure_url);
      console.log(imagesArr);
      fs.unlinkSync(`uploads/${req?.files[i]?.filename}`);
    }

    user.avatar = imagesArr[0];
    await user.save();

    return res.status(200).json({
      _id: userid,
      avatar: imagesArr[0],
      message: "Image uploaded successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, error: true, success: false });
  }
};

export const removeImagefromCloudinary = async (req, res) => {
  const imgUrl = req.query.img;
  const urlArr = imgUrl.split("/");
  const image = urlArr[urlArr.length - 1];
  const imageName = image.split(".")[0];

  if (imageName) {
    const result = await cloudinary.uploader.destroy(
      imageName,
      function (error, result) {
        //console.log(result, error);
      }
    );

    if (result) {
      res.status(200).send(result);
    }
  }
};

export const updateUserDetails = async (req, res) => {
  try {
    const userId = req.userId;
    // Profile se sirf naam, email, mobile badlte hain (password ke liye change-password API hai)
    const { name, email, mobile, country } = req.body;

    const userExist = await User.findById(userId);
    if (!userExist) {
      return res
        .status(404)
        .json({ message: "User not found", error: true, success: false });
    }

    let verifyCode = "";
    if (email && email !== userExist.email) {
      verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    }

    const updateUser = await User.findByIdAndUpdate(
      userId,
      {
        name: name ?? userExist.name,
        email: email || userExist.email,
        mobile: mobile ?? userExist.mobile,
        country: country !== undefined ? String(country).trim().slice(0, 60) : userExist.country,
        verify_email: verifyCode !== "" ? false : userExist.verify_email,
        otp: verifyCode !== "" ? verifyCode : userExist.otp,
        otp_expires: verifyCode !== "" ? Date.now() + 10 * 60 * 1000 : userExist.otp_expires,
      },
      { new: true }
    );

    if (verifyCode !== "") {
      await sendEmailFun(
        email,
        "Verify your email",
        "",
        VerificationEmail(name, verifyCode)
      );
    }

    return res.status(200).json({
      message: "User details updated successfully",
      success: true,
      error: false,
      user: {
        name: updateUser?.name,
        _id: updateUser?._id,
        email: updateUser?.email,
        mobile: updateUser?.mobile,
        country: updateUser?.country,
        avatar: updateUser?.avatar,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ message: "User Not Found!", error: true, success: false });
    }

    let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = verifyCode;
    user.otp_expires = Date.now() + 10 * 60 * 1000; // 10 minutes from now

    await user.save();

    await sendEmailFun(
      email,
      "Verify your email",
      "",
      VerificationEmail(user?.name, verifyCode)
    );

    return res.status(200).json({
      message: "Please check your email to reset your password.",
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const verifyForgotPasswordOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
        error: true,
        success: false,
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ message: "User Not Found!", error: true, success: false });
    }

    if (otp !== user.otp) {
      return res
        .status(400)
        .json({ message: "Invalid OTP", error: true, success: false });
    }

    if (user.otp_expires < Date.now()) {
      return res
        .status(400)
        .json({ message: "OTP Expired", error: true, success: false });
    }

    user.otp = null;
    user.otp_expires = null;
    // Password badalne ke liye 15 min ka ek-baar token (sirf hash DB mein)
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    return res.status(200).json({
      resetToken,
      message: "OTP verified successfully",
      success: true,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// POST /api/user/reset-password { email, resetToken, newPassword, confirmPassword } — forgot password (bina login)
// Token sirf OTP verify karne par milta hai; ek baar chalta hai, 15 min.
export const resetPasswordController = async (req, res) => {
  try {
    const { email, resetToken, newPassword, confirmPassword } = req.body;
    if (!email || !resetToken || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "Please verify the code sent to your email first", error: true, success: false });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters", error: true, success: false });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New Password and Confirm Password do not match", error: true, success: false });
    }
    const user = await User.findOne({ email }).select("+resetTokenHash +resetTokenExpires");
    const hash = crypto.createHash("sha256").update(String(resetToken)).digest("hex");
    if (!user || !user.resetTokenHash || user.resetTokenHash !== hash || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
      return res.status(400).json({ message: "This reset link has expired. Please request a new code.", error: true, success: false });
    }
    user.password = await bcrypt.hash(newPassword, await bcrypt.genSalt(10));
    user.hasPassword = true;
    user.resetTokenHash = "";
    user.resetTokenExpires = null;
    await user.save();
    logActivity(user._id, "password_reset", {}, req);
    return res.status(200).json({ message: "Password reset successfully", success: true, error: false });
  } catch (error) {
    return res.status(500).json({ message: error.message || error, error: true, success: false });
  }
};

// POST /api/user/change-password { oldPassword?, newPassword, confirmPassword } — logged-in user
// Jiska password hai use purana dena hoga; sirf Google wale (bina password) naya set kar sakte hain.
export const changePasswordController = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found", error: true, success: false });
    const needsOld = !!user.password;
    if (needsOld && !oldPassword) return res.status(400).json({ message: "Please enter your current password", error: true, success: false });
    if (!newPassword || String(newPassword).length < 6) return res.status(400).json({ message: "New password must be at least 6 characters", error: true, success: false });
    if (newPassword !== confirmPassword) return res.status(400).json({ message: "New Password and Confirm Password do not match", error: true, success: false });
    if (needsOld && !(await bcrypt.compare(oldPassword, user.password))) {
      return res.status(400).json({ message: "Current password is incorrect", error: true, success: false });
    }
    user.password = await bcrypt.hash(newPassword, await bcrypt.genSalt(10));
    user.hasPassword = true;
    await user.save();
    logActivity(user._id, "password_change", {}, req);
    return res.status(200).json({ message: needsOld ? "Password changed successfully" : "Password set successfully", success: true, error: false });
  } catch (error) {
    return res.status(500).json({ message: error.message || error, error: true, success: false });
  }
};

// POST /api/user/refresh-token  (Authorization: Bearer <refreshToken>) → naya access token
// Token DB wale se match hona chahiye (logout = revoke), account active hona chahiye.
export const refreshTokenController = async (req, res) => {
  try {
    const refreshToken = req?.headers?.authorization?.split(" ")[1] || req.cookies.refreshToken;
    if (!refreshToken || refreshToken === "null") {
      return res.status(401).json({ message: "No refresh token provided", error: true, success: false });
    }
    let payload;
    try {
      payload = jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH_TOKEN);
    } catch {
      return res.status(401).json({ message: "Session expired. Please log in again.", error: true, success: false });
    }
    const user = await User.findById(payload.id).select("refreshToken status");
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: "Session expired. Please log in again.", error: true, success: false });
    }
    if (user.status && user.status !== "active") {
      return res.status(403).json({ message: "Your account has been suspended. Please contact support.", error: true, success: false, suspended: true });
    }
    const newAccessToken = await generateAccessToken(user._id);
    res.cookie("accessToken", newAccessToken, { httpOnly: true, secure: true, sameSite: "None" });
    return res.status(200).json({ message: "New Access Token generated", error: false, success: true, data: { accessToken: newAccessToken } });
  } catch (error) {
    return res.status(500).json({ message: error.message || error, error: true, success: false });
  }
};

export const userDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select("-password -refreshToken -otp -otp_expires");
    return res.status(200).json({
      message: "User details fetched successfully",
      success: true,
      error: false,
      user
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, error: true, success: false });
  }
}

export const resendVerificationOtpController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
        error: true,
        success: false,
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ message: "User Not Found!", error: true, success: false });
    }

    if (user.verify_email) {
      return res.status(400).json({
        message: "Email is already verified",
        error: true,
        success: false,
      });
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = verifyCode;
    user.otp_expires = Date.now() + 10 * 60 * 1000; // 10 minutes from now

    await user.save();

    await sendEmailFun(
      email,
      "Verify your email",
      "",
      VerificationEmail(user.name, verifyCode)
    );

    return res.status(200).json({
      message: "Verification OTP resent successfully",
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// ─── Google OAuth Login ────────────────────────────────────────────────────
export const googleLoginController = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        message: "ID token is required",
        error: true,
        success: false,
      });
    }

    // Verify the Google ID token on the server using Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { name, email, picture, uid } = decodedToken;

    if (!email) {
      return res.status(400).json({
        message: "Could not retrieve email from Google account",
        error: true,
        success: false,
      });
    }

    // Find existing user or create a new one
    let user = await User.findOne({ email });

    if (!user) {
      // New user — create with Google details, no password needed
      user = new User({
        name: name || email.split("@")[0],
        email,
        avatar: picture || "",
        googleId: uid,
        loginWithGoogle: true,
        verify_email: true,       // Google already verified the email
        status: "active",
      });
      await user.save();
      logActivity(user._id, "signup", { method: "google" }, req);
    } else {
      // Existing user — update googleId and flag if not already set
      let changed = false;
      if (!user.googleId) {
        user.googleId = uid;
        user.loginWithGoogle = true;
        if (picture && !user.avatar) user.avatar = picture;
        changed = true;
      }
      // Google ne email verify kar diya hai, to account bhi verified maano
      if (!user.verify_email && decodedToken.email_verified) {
        user.verify_email = true;
        changed = true;
      }
      if (changed) await user.save();
    }

    // Check account status
    if (user.status !== "active") {
      return res.status(400).json({
        message: `Your account is ${user.status}. Please contact support.`,
        error: true,
        success: false,
      });
    }

    // Issue your existing JWT tokens
    const accessToken = await generateAccessToken(user._id);
    const refreshToken = await generateRefreshToken(user._id, req.body.remember !== false);

    await User.findByIdAndUpdate(user._id, { last_login_date: Date.now() });
    logActivity(user._id, "login", { method: "google" }, req);

    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };
    res.cookie("accessToken", accessToken, cookiesOption);
    res.cookie("refreshToken", refreshToken, cookiesOption);

    return res.status(200).json({
      message: "Login Successful",
      success: true,
      error: false,
      data: {
        accessToken,
        refreshToken,
        // password hash / otp / refresh token frontend ko nahi bhejte
        user: await User.findById(user._id).select("-password -refreshToken -otp -otp_expires"),
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// ── Admin: users ──
// Sirf safe fields (password / otp / tokens kabhi nahi)
export const getAllUsersController = async (req, res) => {
  try {
    const [users, orderAgg] = await Promise.all([
      User.find()
        .select("name email mobile avatar role verify_email status createdAt last_login_date googleId")
        .sort({ createdAt: -1 })
        .lean(),
      // har user ke orders + kharcha (cancelled ko spent mein nahi ginte)
      Order.aggregate([
        {
          $group: {
            _id: "$userId",
            orders: { $sum: 1 },
            spent: { $sum: { $cond: [{ $ne: ["$orderStatus", "cancelled"] }, "$totalAmt", 0] } },
            lastOrderAt: { $max: "$createdAt" },
          },
        },
      ]),
    ]);
    const byUser = Object.fromEntries(orderAgg.map((o) => [String(o._id), o]));
    const data = users.map(({ googleId, ...u }) => {
      const o = byUser[String(u._id)];
      return { ...u, signupMethod: googleId ? "google" : "email", orders: o?.orders || 0, spent: o?.spent || 0, lastOrderAt: o?.lastOrderAt || null };
    });
    return res.status(200).json({ error: false, success: true, data });
  } catch (error) {
    return res.status(500).json({ message: error.message || error, error: true, success: false });
  }
};

// Kai users ek saath delete. Admin accounts (aur khud) kabhi delete nahi.
// User ka cart / address / my list bhi hatata hai. Orders + reviews rehte hain (hisaab / rating).
export const deleteMultipleUsersController = async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
    if (ids.length === 0) {
      return res.status(400).json({ message: "No users selected", error: true, success: false });
    }

    const users = await User.find({ _id: { $in: ids }, role: { $ne: "admin" } }).select("_id");
    const deletableIds = users.map((u) => u._id).filter((id) => String(id) !== String(req.userId));
    if (deletableIds.length === 0) {
      return res.status(400).json({ message: "Admin accounts can't be deleted", error: true, success: false });
    }

    await Promise.all([
      CartProduct.deleteMany({ userId: { $in: deletableIds } }),
      Address.deleteMany({ userId: { $in: deletableIds } }),
      MyList.deleteMany({ userId: { $in: deletableIds.map(String) } }),
    ]);
    const result = await User.deleteMany({ _id: { $in: deletableIds } });

    const skipped = ids.length - result.deletedCount;
    return res.status(200).json({
      message: `${result.deletedCount} user(s) deleted` + (skipped > 0 ? `, ${skipped} skipped (admin)` : ""),
      error: false,
      success: true,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || error, error: true, success: false });
  }
};

// ── Admin: ek user ki details + status / role ──
// PUT /api/user/admin/:id { status?: "active"|"Suspended", role?: "user"|"admin" }
export const adminUpdateUserController = async (req, res) => {
  try {
    if (String(req.params.id) === String(req.userId)) {
      return res.status(400).json({ message: "You can't change your own account here", error: true, success: false });
    }
    const upd = {};
    if (["active", "Suspended"].includes(req.body.status)) upd.status = req.body.status;
    if (["user", "admin"].includes(req.body.role)) upd.role = req.body.role;
    if (!Object.keys(upd).length) return res.status(400).json({ message: "Nothing to update", error: true, success: false });
    if (upd.role === "user") {
      const admins = await User.countDocuments({ role: "admin", _id: { $ne: req.params.id } });
      if (!admins) return res.status(400).json({ message: "At least one admin is required", error: true, success: false });
    }
    const user = await User.findByIdAndUpdate(req.params.id, upd, { new: true }).select("name email role status");
    if (!user) return res.status(404).json({ message: "User not found", error: true, success: false });
    return res.status(200).json({ message: "User updated", error: false, success: true, data: user });
  } catch (error) {
    return res.status(500).json({ message: error.message || error, error: true, success: false });
  }
};

// GET /api/user/admin/:id/details — profile + addresses + orders + wishlist + cart
export const adminUserDetailsController = async (req, res) => {
  try {
    const { default: Address } = await import("../models/Address.js");
    const { default: CartProduct } = await import("../models/CartProduct.js");
    const MyListMod = await import("../models/MyList.js");
    const MyList = MyListMod.default || MyListMod.MyList;
    const user = await User.findById(req.params.id)
      .select("name email mobile avatar role verify_email status createdAt last_login_date googleId country").lean();
    if (!user) return res.status(404).json({ message: "User not found", error: true, success: false });
    const [addresses, orders, wishlist, cart] = await Promise.all([
      Address.find({ userId: user._id }).lean(),
      Order.find({ userId: user._id }).sort({ createdAt: -1 }).lean(),
      MyList.find({ userId: String(user._id) }).lean().then(async (list) => {
        const { default: Product } = await import("../models/Product.js");
        const ps = await Product.find({ _id: { $in: list.map((x) => x.productId) } }).select("name images price").lean();
        return list.map((x) => ({ ...x, productId: ps.find((p) => String(p._id) === String(x.productId)) || null }));
      }),
      CartProduct.find({ userId: user._id }).populate("productId", "name images price").lean(),
    ]);
    const { googleId, ...u } = user;
    return res.status(200).json({ error: false, success: true, data: { user: { ...u, signupMethod: googleId ? "google" : "email" }, addresses, orders, wishlist, cart } });
  } catch (error) {
    return res.status(500).json({ message: error.message || error, error: true, success: false });
  }
};
