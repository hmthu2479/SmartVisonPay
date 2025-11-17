import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Snackbar,
  Alert,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

// ---------------- Validators ----------------
const emailValidator = (value: string) => {
  if (!value) return "Email is required";
  if (!/^[a-zA-Z0-9._:$!%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]+$/.test(value)) {
    return "Invalid email address";
  }
  return "";
};

// ---------------- Component ----------------
export default function LoginKiosk() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const handleClose = () => setSnackbar({ ...snackbar, open: false });

  const handleLogin = async () => {
    const emailErr = emailValidator(email);
    setEmailError(emailErr);

    if (emailErr) return;

    setLoading(true); // start loading

    try {
      const res = await fetch(`${API_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        navigate("/kiosk/auth", { state: { fromLogin: true, email } });
      } else {
        setSnackbar({
          open: true,
          message: data.msg || "Sai email hoặc email tồn tại!",
          severity: "error",
        });
      }
    } catch (err) {
      console.error("Error:", err);
      setSnackbar({
        open: true,
        message: "Lỗi khi đăng nhập!",
        severity: "error",
      });
    } finally {
      setLoading(false); // stop loading
    }
  };
  return (
    <div className="flex justify-center flex-col items-center min-h-screen pb-3">
      {/* Header */}
      <Typography
        variant="h3"
        fontWeight="800"
        align="center"
        sx={{
          background: "linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          mb: 5,
          letterSpacing: 1.5,
        }}
      >
        Smart<span style={{ color: "#ffb300" }}>Vision</span>Pay
      </Typography>

      {/* Form */}
      <Box
        className="flex flex-col gap-5 w-[90%] max-w-md rounded-3xl p-8 backdrop-blur-xl ring-2 ring-blue-500/50 transition-all duration-500"
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
      >
        <TextField
          label="Email"
          type="email"
          fullWidth
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError(emailValidator(e.target.value));
          }}
          error={!!emailError}
          helperText={emailError}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={loading || !!emailError || !email}
          sx={{ height: 48 }}
        >
          {loading ? (
            <CircularProgress
              size={26}
              color="inherit"
              sx={{ color: "white" }}
            />
          ) : (
            "Verify Email"
          )}
        </Button>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
