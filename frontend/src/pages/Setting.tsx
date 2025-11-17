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

const API_URL = import.meta.env.VITE_API_URL;

export default function Setting() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const handleSubmit = async () => {
    if (newPassword !== confirmPassword) {
      setSnackbar({
        open: true,
        message: "Passwords do not match!",
        severity: "error",
      });
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const userId = localStorage.getItem("userId");

      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify({
          userId,
          newPassword: confirmPassword,
        }),
      });

      if (!res.ok) throw new Error("Failed to reset password");

      setSnackbar({
        open: true,
        message: "Thay đổi mật khẩu thành công!",
        severity: "success",
      });

      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setSnackbar({
        open: true,
        message: "Something went wrong!",
        severity: "error",
      });
    }
  };

  return (
    <div className="flex justify-center items-center h-full bg-gray-50">
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
      <Paper
        elevation={4}
        className="p-8 rounded-2xl w-full max-w-md flex flex-col gap-8"
      >
        <Typography
          variant="h5"
          className="text-center font-bold text-gray-700"
        >
          Thay đổi mật khẩu
        </Typography>

        <Box className="flex flex-col gap-6">
          <TextField
            label="Mật khẩu mới"
            type="password"
            variant="outlined"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <TextField
            label="Nhập lại mật khẩu mới"
            type="password"
            variant="outlined"
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handleSubmit}
            disabled={!newPassword || !confirmPassword}
          >
            Xác nhận
          </Button>
        </Box>
      </Paper>
    </div>
  );
}
