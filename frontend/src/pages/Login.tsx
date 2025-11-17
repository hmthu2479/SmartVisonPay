import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Snackbar,
  Alert,
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

const passwordValidator = (value: string) => {
  if (!value) return "Password is required";
  if (value.length < 6) return "Password must be at least 6 characters";
  return "";
};

// ---------------- Component ----------------
export default function Login() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const handleClose = () => setSnackbar({ ...snackbar, open: false });

  const handleLogin = async () => {
    // validate lại trước khi submit
    const emailErr = emailValidator(email);
    const passwordErr = passwordValidator(password);

    setEmailError(emailErr);
    setPasswordError(passwordErr);

    if (emailErr || passwordErr) return;

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("userId", data.userId);
        navigate("/");
      } else {
        setSnackbar({
          open: true,
          message: "Sai email hoặc mật khẩu!",
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
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-blue-400">
      <Paper
        elevation={4}
        className="p-8 rounded-2xl w-full max-w-md flex flex-col gap-8"
      >
        {/* Header */}
        <Typography
          variant="h5"
          className="text-center font-bold text-blue-600"
        >
          Login
        </Typography>

        {/* Form */}
        <Box
          className="flex flex-col gap-6"
          component="form"
          onSubmit={(e) => {
            e.preventDefault(); // prevent page reload
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
          <TextField
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError(passwordValidator(e.target.value));
            }}
            error={!!passwordError}
            helperText={passwordError}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={!!emailError || !!passwordError || !email || !password}
          >
            Login
          </Button>
        </Box>

        {/* Footer */}
        <Typography variant="body2" className="text-center text-gray-500">
          Don’t have an account?{" "}
          <a href="/signup" className="text-blue-600 font-semibold">
            Sign up
          </a>
        </Typography>
      </Paper>

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
