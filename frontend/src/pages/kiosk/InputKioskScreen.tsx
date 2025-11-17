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
import { useKioskStore } from "../../store/useKiosk";

// ---------------- Validators ----------------

//If code not string K000 (mean with 3 digits after K)
const kioskValidator = (value: string) => {
  if (!value) return "Kiosk code is required";
  if (!/^K\d{3}$/.test(value)) {
    return "Invalid kiosk code";
  }

  return "";
};

// ---------------- Component ----------------
export default function InputKioskScreen() {
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { getKioskByCode } = useKioskStore();

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const handleClose = () => setSnackbar({ ...snackbar, open: false });

  const handleLogin = async (code: string) => {
    const codeErr = kioskValidator(code);
    setCodeError(codeErr);

    if (codeErr) return;

    setLoading(true); // start loading

    try {
      const kiosk = await getKioskByCode(code);

      if (kiosk) {
        navigate("/kiosk");
        console.log("🚀 ~ handleLogin ~ kiosk:", kiosk);
      } else {
        setSnackbar({
          open: true,
          message: "Không tìm thấy kiosk code!",
          severity: "error",
        });
      }
    } catch (err) {
      console.error("Error:", err);
      setSnackbar({
        open: true,
        message: "Lỗi tìm kiosk code!",
        severity: "error",
      });
    } finally {
      setLoading(false);
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
        className="flex flex-col gap-5 w-[90%] max-w-md rounded-3xl bg-white/10 p-8 backdrop-blur-xl ring-2 ring-blue-500/50 transition-all duration-500"
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin(code);
        }}
      >
        <TextField
          label="Code"
          fullWidth
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setCodeError(kioskValidator(e.target.value));
          }}
          error={!!codeError}
          helperText={codeError}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={loading || !!codeError || !code}
          sx={{ height: 48 }}
        >
          {loading ? (
            <CircularProgress
              size={26}
              color="inherit"
              sx={{ color: "white" }}
            />
          ) : (
            "Get kiosk"
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
