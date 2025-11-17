import { useRef, useState } from "react";
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
type Validator = (value: string) => string;

interface ValidatedTextFieldProps {
  label: string;
  name: string;
  validator: Validator;
  onChange: (value: string, isValid: boolean) => void;
}

const ValidatedTextField: React.FC<ValidatedTextFieldProps> = ({
  label,
  name,
  validator,
  onChange,
}) => {
  const [value, setValue] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const errorMessage = validator(newValue);
    setValue(newValue);
    setError(errorMessage);
    onChange(newValue, !errorMessage);
  };

  return (
    <TextField
      name={name}
      label={label}
      value={value}
      onChange={handleChange}
      error={!!error}
      helperText={error}
      fullWidth
    />
  );
};

// ---------------- Validators ----------------
const nameValidator: Validator = (value) => {
  if (value.length < 3) return "Name must be at least 3 characters long";
  if (value.length > 20) return "Name must be less than 20 characters long";
  return "";
};

const emailValidator: Validator = (value) => {
  if (!/^[a-zA-Z0-9._:$!%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]+$/.test(value))
    return "Invalid email address";
  return "";
};

const passwordValidator: Validator = (value) => {
  if (value.length < 6) return "Password must be at least 6 characters long";
  if (!/[A-Z]/.test(value))
    return "Password must contain at least one uppercase letter";
  if (!/[0-9]/.test(value)) return "Password must contain at least one number";
  return "";
};

// ---------------- Component ----------------
export default function Signup() {
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [passwordError, setPasswordError] = useState<string>("");
  const [confirmError, setConfirmError] = useState<string>("");

  // track field validity
  const formValid = useRef({
    name: false,
    email: false,
    password: false,
    confirm: false,
  });

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const handleClose = () => setSnackbar({ ...snackbar, open: false });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPass = e.target.value;
    setFormValues((prev) => ({ ...prev, password: newPass }));

    const errorMsg = passwordValidator(newPass);
    setPasswordError(errorMsg);
    formValid.current.password = !errorMsg;

    if (confirmPassword && confirmPassword !== newPass) {
      setConfirmError("Passwords do not match");
      formValid.current.confirm = false;
    } else {
      setConfirmError("");
      formValid.current.confirm = true;
    }
  };

  const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const confirmVal = e.target.value;
    setConfirmPassword(confirmVal);

    if (confirmVal !== formValues.password) {
      setConfirmError("Passwords do not match");
      formValid.current.confirm = false;
    } else {
      setConfirmError("");
      formValid.current.confirm = true;
    }
  };

  const handleFieldChange = (field: string, value: string, isValid: boolean) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    formValid.current = { ...formValid.current, [field]: isValid };
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (Object.values(formValid.current).every((isValid) => isValid)) {
      try {
        const res = await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formValues), // ✅ gửi đúng giá trị input
        });

        const data = await res.json();

        if (res.ok) {
          setSnackbar({
            open: true,
            message:
              "Đăng ký thành công. Vui lòng kiểm tra email để xác thực.",
            severity: "success",
          });
        } else {
          setSnackbar({
            open: true,
            message: data.msg || "Đăng ký thất bại!",
            severity: "error",
          });
        }
      } catch (err) {
        console.error("Error:", err);
        setSnackbar({
          open: true,
          message: "Lỗi khi gửi form!",
          severity: "error",
        });
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-blue-400">
      <Paper
        elevation={4}
        component="form"
        onSubmit={handleSubmit}
        className="p-8 rounded-2xl w-full max-w-md flex flex-col gap-8"
      >
        {/* Header */}
        <Typography
          variant="h5"
          className="text-center font-bold text-blue-600"
        >
          Sign Up
        </Typography>

        {/* Form */}
        <Box className="flex flex-col gap-6">
          <ValidatedTextField
            name="name"
            label="Name"
            validator={nameValidator}
            onChange={(value, isValid) =>
              handleFieldChange("name", value, isValid)
            }
          />
          <ValidatedTextField
            name="email"
            label="Email"
            validator={emailValidator}
            onChange={(value, isValid) =>
              handleFieldChange("email", value, isValid)
            }
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            value={formValues.password}
            onChange={handlePasswordChange}
            error={!!passwordError}
            helperText={passwordError}
          />
          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            value={confirmPassword}
            onChange={handleConfirmChange}
            error={!!confirmError}
            helperText={confirmError}
          />

          <Button
            variant="contained"
            fullWidth
            size="large"
            type="submit"
            disabled={
              !Object.values(formValid.current).every((isValid) => isValid)
            }
          >
            Sign Up
          </Button>
        </Box>

        {/* Footer */}
        <Typography variant="body2" className="text-center text-gray-500">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 font-semibold">
            Login
          </a>
        </Typography>
      </Paper>
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
