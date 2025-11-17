import { useState, useEffect } from "react";
import { useLocation, Navigate, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  Stack,
  CircularProgress,
  Alert,
} from "@mui/material";

const VerifyEmailScreen = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const location = useLocation();
  const navigate = useNavigate();
  const fromLogin = location.state?.fromLogin;
  const email = location.state?.email;

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Countdown for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  useEffect(() => {
    if (message||error) {
      const timer = setTimeout(()=>{
        setMessage("");setError("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message,error]);


  // 🚫 Prevent direct access
  if (!fromLogin || !email) {
    return <Navigate to="/kiosk/login" replace />;
  }

  // Handle verify OTP
  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("Vui lòng nhập đủ 6 số OTP");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.msg || "OTP không hợp lệ");

      localStorage.setItem("kioskToken", data.token);
      setMessage("Xác thực thành công!");
      navigate("/kiosk/find")
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    try {
      setResendTimer(30);
      setMessage("");
      setError("");
      const res = await fetch(`${API_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "OTP không hợp lệ");
      setMessage("OTP mới đã được gửi tới email của bạn");
    } catch {
      setError("Không thể gửi lại OTP, vui lòng thử lại sau");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
        p: 2,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 400,
          bgcolor: "white",
          p: 4,
          borderRadius: 3,
          boxShadow: 3,
          textAlign: "center",
        }}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Xác thực Email
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Nhập mã OTP đã gửi tới <strong>{email}</strong>
        </Typography>

        {message && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack spacing={2}>
          <TextField
            label="Mã OTP"
            variant="outlined"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            slotProps={{
              input: {
                inputProps: {
                  maxLength: 6,
                  style: {
                    textAlign: "center",
                    letterSpacing: "10px",
                    fontSize: "20px",
                  },
                },
              },
            }}
          />

          <Button
            variant="contained"
            color="primary"
            onClick={handleVerify}
            disabled={loading}
            sx={{ height: 45 }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Xác thực"
            )}
          </Button>

          <Button
            variant="text"
            color="secondary"
            onClick={handleResend}
            disabled={resendTimer > 0}
          >
            {resendTimer > 0
              ? `Gửi lại OTP sau ${resendTimer}s`
              : "Gửi lại OTP"}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default VerifyEmailScreen;
