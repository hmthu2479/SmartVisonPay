const express = require("express");
const { sendOtp } = require("../controller/auth.controller");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");
require("dotenv").config();
const path = require("path");
const crypto = require("crypto");

const router = express.Router();

/**
 * 📌 API Đăng ký
 */
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  console.log("🚀 ~ name, email, password:", name, email, password);

  try {
    // Kiểm tra email đã tồn tại chưa
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "Email đã được sử dụng" });

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
    });

    await user.save();

    // Tạo token xác thực email
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Kiểm tra biến môi trường
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({ msg: "Lỗi cấu hình email" });
    }

    // Cấu hình SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Hệ thống" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Xác nhận tài khoản",
      html: `
        <h3>Chào ${name},</h3>
        <p>Nhấn vào link dưới đây để xác thực tài khoản:</p>
        <a href="http://localhost:5000/api/auth/verify?token=${encodeURIComponent(
          token
        )}">Xác thực tài khoản</a>
      `,
    };

    // Gửi email
    await transporter.sendMail(mailOptions);
    res.json({
      msg: "Đăng ký thành công! Hãy kiểm tra email để xác thực tài khoản.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Lỗi server");
  }
});

/**
 * 📌 API Xác nhận Email
 */
router.get("/verify", async (req, res) => {
  try {
    const { token } = req.query;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ email: decoded.email });
    if (!user)
      return res
        .status(400)
        .json({ msg: "Token không hợp lệ hoặc người dùng không tồn tại" });

    // Cập nhật trạng thái xác thực
    user.isVerified = true;
    await user.save();
    res.redirect("http://localhost:5173/login?verified=true");
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "❌ Xác thực thất bại hoặc token đã hết hạn" });
  }
});

/**
 * 📌 API gửi otp
 */
const otpStore = new Map(); // { email: { otp, expiresAt } }

router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    console.log("🚀 ~ email:", email);
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Email chưa được đăng ký" });
    const record = otpStore.get(email);
    // ⏱️ Check if user requested OTP too soon
    if (record && Date.now() - record.lastSent < 60 * 1000) {
      return res
        .status(429)
        .json({ msg: "Vui lòng chờ 1 phút trước khi gửi lại OTP" });
    }
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins

    otpStore.set(email, { otp, expiresAt, lastSent: Date.now() });

    // Setup email transporter
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send OTP mail
    await transporter.sendMail({
      from: `"SmartVisonPay" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Mã xác nhận OTP của bạn",
      text: `Mã OTP của bạn là ${otp}. Mã sẽ hết hạn sau 5 phút.`,
    });

    res.json({ msg: "✅ OTP đã được gửi tới email của bạn" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Lỗi khi gửi OTP" });
  }
});

/**
 * 📌 API xác thực mã otp
 */
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = otpStore.get(email);
    if (!record)
      return res.status(400).json({ msg: "OTP không tồn tại hoặc đã hết hạn" });

    if (record.expiresAt < Date.now())
      return res.status(400).json({ msg: "OTP đã hết hạn" });

    if (record.otp !== otp)
      return res.status(400).json({ msg: "OTP không đúng" });

    // ✅ Mark user as verified
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "Người dùng không tồn tại" });

    user.isVerified = true;
    await user.save();

    // Remove OTP record
    otpStore.delete(email);
    // Tạo token xác thực email
    const token = jwt.sign(
      { id: user._id, role: "kiosk" },
      process.env.JWT_SECRET
    );
    res.status(200).json({
      msg: "✅ Xác thực thành công",
      token,
      userId: user._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Lỗi xác thực OTP" });
  }
});

/**
 * 📌 API Đăng nhập
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Email không tồn tại" });

    if (!user.isVerified)
      return res.status(400).json({ msg: "Email chưa được xác thực" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ msg: "Mật khẩu không chính xác" });

    const token = jwt.sign(
      { id: user._id, role: "admin" },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );
    res.status(200).json({
      msg: "Đăng nhập thành công!",
      token,
      userId: user._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Lỗi server");
  }
});
//Người dùng ấn quên mật khẩu hiện ra form nhập email.Người dùng nhập email và ấn xác nhận
//sau đó gọi api /forgot-password cung cấp email nhận về roomId, sau khi có roomId thì người dùng sử dùng
// socket join-reset-room(emit) để tham gia phòng, tiếp đó người dùng mở email và ấn vào link email
//người dùng sẽ nhận sk reset-password-verified(on) trong sk này ngừi dugn2 sẽ nhận dc userId
//sau khi có userId người dùng sẽ chuyển trang nhập mật khẩu, nhập xong mk mới ấn xác nhận gọi api /reset-password"
//cung cấp userId và mật khẩu mới xong nhận về status 200 và thông báo Đặt lại mật khẩu thành công oke thì chuyển
//trang đăng nhập
/**
 * 📌 API Quên mật khẩu
 */
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Người dùng không tồn tại" });

    // Tạo token quên mật khẩu
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    const roomId = crypto.randomBytes(16).toString("hex"); // 32 ký tự hex
    // redisClient.setex(roomId, 900, user._id.toString()); // Lưu 15 phút

    // Gửi email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Yêu cầu đặt lại mật khẩu",
      html: `
        <h3>Chào ${user.name},</h3>
        <p>Nhấn vào link dưới đây để đặt lại mật khẩu:</p>
        <a href="http://localhost:5000/api/auth/verify-reset-password?token=${token}&room=${roomId}">Đặt lại mật khẩu</a>
      `,
    };

    await transporter.sendMail(mailOptions);
    // Tạo mã phòng tạm khi gửi email

    res.status(200).json({ roomId });
  } catch (error) {
    console.error(error);
    res.status(500).send("Lỗi server quên mật khẩu");
  }
});

/**
 * 📌 API xác thực quên mật khẩu
 */
router.get("/verify-reset-password", async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Kiểm tra userId có tồn tại hay không
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.sendFile(path.join(__dirname, "../public/invalid-token.html"));
    }

    // Nếu hợp lệ → trả về trang HTML xác nhận
    // Chú ý: thay đổi từ verify.html thành verified.html để khớp với file thực tế
    // res.sendFile(path.join(__dirname, '../public/verified.html'));

    // Redirect về frontend app với token và room
    return res.redirect(
      `http://localhost:5173/login/change-password?token=${encodeURIComponent(
        token
      )}`
    );
  } catch (err) {
    console.error("Lỗi xác thực:", err);
    // Token không hợp lệ hoặc hết hạn
    res.sendFile(path.join(__dirname, "../public/invalid-token.html"));
  }
});
/**
 * api xác thực token
 */
router.post("/verify-token", async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ msg: "User không tồn tại" });
    console.log("Đã xác thực token cho user", user);
    res.status(200).json({ userId: user._id });
  } catch (err) {
    res.status(400).json({ msg: "Token không hợp lệ hoặc đã hết hạn" });
  }
});

/**
 * api đật lại mật khẩu
 */
router.post("/reset-password", async (req, res) => {
  const { userId, newPassword } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    res.status(200).json({ msg: "Đặt lại mật khẩu thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Lỗi server");
  }
});

module.exports = router;
