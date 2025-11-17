import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomerStore } from "../../store/useCustomer";
import { Alert, Snackbar } from "@mui/material";
import { useKioskStore } from "../../store/useKiosk";

export default function MainPageScreen() {
  const [openMemberDialog, setOpenMemberDialog] = useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [memberName, setMemberName] = useState("");
  const [memberPhone, setMemberPhone] = useState("");
  const [paymentPhone, setPaymentPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const { getCustomerByPhone, addCustomer } = useCustomerStore();
  const { kioskGetByCode } = useKioskStore();
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const handleClose = () => setSnackbar({ ...snackbar, open: false });
  const vnPhoneRegex = /^(0|\+84)\d{9}$/;
  const navigate = useNavigate();
  useEffect(() => {
    const handler = setTimeout(() => {
      const cleaned = paymentPhone.replace(/\s|-/g, "");
      // If empty → clear error
      if (!cleaned) {
        setPhoneError("");
        return;
      }

      if (!vnPhoneRegex.test(cleaned)) {
        setPhoneError("Số điện thoại không hợp lệ");
      } else {
        setPhoneError("");
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [paymentPhone]);
  const handlePay = async (paymentPhone: string) => {
    setLoading(true);

    try {
      const cleaned = paymentPhone.replace(/\s|-/g, "");
      if (!cleaned) {
        navigate("/kiosk/scan");
        return;
      }

      if (vnPhoneRegex.test(cleaned)) {
        const customer = await getCustomerByPhone(cleaned);
        if (customer) {
          setOpenPaymentDialog(false);
          navigate("/kiosk/scan");
          console.log("🚀 ~ handlePay ~ phone:", cleaned);
        } else {
          setSnackbar({
            open: true,
            message: "Không tìm thấy khách hàng!",
            severity: "error",
          });
        }
      }
    } catch (err) {
      console.error("Error:", err);
      setSnackbar({
        open: true,
        message: "Lỗi khi tìm kiếm khách hàng!",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const nameValidator = (name: string) => {
    if (!name) return "Tên là bắt buộc";
    return "";
  };

  const phoneValidator = (phone: string) => {
    if (!phone) return "Số điện thoại là bắt buộc";

    // Remove spaces or dashes
    const cleaned = phone.replace(/\s|-/g, "");

    // Regex for Vietnam phone numbers: 0xxxxxxxxx or +84xxxxxxxxx
    const vnPhoneRegex = /^(0|\+84)(3|5|7|8|9)\d{8}$/;

    if (!vnPhoneRegex.test(cleaned)) {
      return "Số điện thoại không hợp lệ (ví dụ: 0912345678)";
    }

    return "";
  };

  const handleCreateCustomer = async (
    memberName: string,
    memberPhone: string
  ) => {
    setLoading(true); // start loading

    try {
      console.log("Create member:", { memberName, memberPhone });
      addCustomer(memberName, memberPhone);
      setOpenMemberDialog(false);
      setMemberName("");
      setMemberPhone("");
      setSnackbar({
        open: true,
        message: `Chúc mừng ${memberPhone} tạo thành viên thành công!`,
        severity: "success",
      });
    } catch (err) {
      console.error("Error:", err);
      setSnackbar({
        open: true,
        message: "Lỗi tìm phone!",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#2868c7] via-[#3a8ee2] to-[#6ebaf9]">
      {/* Subtle background glow */}
      <div className="absolute top-28 left-10 h-[200px] w-[200px] rounded-full bg-white/10 blur-[50px] animate-floatSoft"></div>
      <div className="absolute bottom-[-80px] right-[-40px] h-[300px] w-[300px] rounded-full bg-white/10 blur-[70px] animate-floatSoft2"></div>

      {/* Title */}
      <h1 className="text-center text-5xl font-extrabold text-white drop-shadow-md transition-all duration-500">
        Smart<span className="text-yellow-400">Vision</span>Pay
      </h1>
      <p className="mt-3 text-lg text-white/90 transition-opacity duration-700">
        Chào mừng bạn đến với hệ thống thanh toán tự động
      </p>

      {/* Buttons */}
      <div className="mt-10 w-[90%] max-w-md rounded-3xl bg-white/10 p-8 backdrop-blur-xl shadow-xl transition-all duration-500">
        <button
          onClick={() => setOpenPaymentDialog(true)}
          className="w-full py-4 text-2xl font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-400 shadow-md hover:scale-[1.02] hover:shadow-lg active:scale-95 transition-all duration-200"
        >
          Thanh toán
        </button>

        <div className="my-5 flex items-center justify-center text-white/70 font-semibold">
          hoặc
        </div>

        <button
          onClick={() => setOpenMemberDialog(true)}
          className="w-full py-4 text-2xl font-bold rounded-xl text-white bg-gradient-to-r from-orange-500 to-yellow-400 shadow-md hover:scale-[1.02] hover:shadow-lg active:scale-95 transition-all duration-200"
        >
          Tạo thành viên
        </button>
      </div>

      {/* Member Dialog */}
      {openMemberDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-200">
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 animate-fadeSoft">
            <button
              onClick={() => {
                setOpenMemberDialog(false);
                setMemberName("");
                setMemberPhone("");
                setNameError("");
                setPhoneError("");
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
            >
              ✕
            </button>

            <h2 className="text-center text-2xl font-bold text-orange-600 mb-5">
              Tạo thành viên
            </h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateCustomer(memberName, memberPhone);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên thành viên
                </label>
                <input
                  type="text"
                  value={memberName}
                  onChange={(e) => {
                    setMemberName(e.target.value);
                    setNameError(nameValidator(e.target.value));
                  }}
                  className={`w-full rounded-lg border px-4 py-2 outline-none focus:ring-2 ${
                    nameError
                      ? "border-red-400 focus:ring-red-300"
                      : "border-gray-300 focus:ring-orange-400"
                  }`}
                />
                {nameError && (
                  <p className="text-sm text-red-500 mt-1">{nameError}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  value={memberPhone}
                  onChange={(e) => {
                    setMemberPhone(e.target.value);
                    setPhoneError(phoneValidator(e.target.value));
                  }}
                  className={`w-full rounded-lg border px-4 py-2 outline-none focus:ring-2 ${
                    phoneError
                      ? "border-red-400 focus:ring-red-300"
                      : "border-gray-300 focus:ring-orange-400"
                  }`}
                />
                {phoneError && (
                  <p className="text-sm text-red-500 mt-1">{phoneError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !!nameError || !memberName || !memberPhone}
                className={`w-full rounded-lg py-2 font-bold text-white transition-transform ${
                  loading ||
                  !!nameError ||
                  !memberName ||
                  !memberPhone ||
                  !!phoneError
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-orange-500 to-yellow-400 hover:scale-[1.02]"
                }`}
              >
                {loading ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Payment Dialog */}
      {openPaymentDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 animate-fadeSoft">
            <button
              onClick={() => {
                setOpenPaymentDialog(false);
                setPaymentPhone("");
                setPhoneError("");
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
            >
              ✕
            </button>

            <h2 className="text-center text-2xl font-bold text-blue-600 mb-4">
              Thanh toán
            </h2>

            <p className="text-gray-500 mb-4 text-center text-sm">
              Nhập số điện thoại để tích điểm hoặc{" "}
              <span
                className="text-blue-600 font-semibold underline cursor-pointer hover:text-blue-800"
                onClick={() => {
                  setOpenPaymentDialog(false);
                  setOpenMemberDialog(true);
                }}
              >
                đăng ký thành viên
              </span>
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handlePay(paymentPhone);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại (tuỳ chọn)
                </label>
                <input
                  type="text"
                  value={paymentPhone}
                  onChange={(e) => {
                    setPaymentPhone(e.target.value);
                  }}
                  className={`w-full rounded-lg border px-4 py-2 outline-none focus:ring-2 ${
                    phoneError
                      ? "border-red-400 focus:ring-red-300"
                      : "border-gray-300 focus:ring-orange-400"
                  }`}
                />
                {phoneError && (
                  <p className="text-sm text-red-500 mt-1">{phoneError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !!phoneError}
                className={`w-full rounded-lg py-2 font-bold text-white transition-transform ${
                  loading || !!phoneError
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-blue-400 hover:scale-[1.02]"
                }`}
              >
                {loading ? "Đang xử lý..." : "Tiếp tục"}
              </button>
            </form>
          </div>
        </div>
      )}

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

      <p className="mt-10 text-lg font-bold text-white/90 transition-opacity duration-700 opacity-70">
        Kiosk: {kioskGetByCode?.code}
      </p>

      {/* Animation */}
      <style>{`
        @keyframes floatSoft {
          0%, 100% { transform: translateY(0); opacity: 0.7; }
          50% { transform: translateY(-10px); opacity: 1; }
        }
        @keyframes floatSoft2 {
          0%, 100% { transform: translateY(0); opacity: 0.6; }
          50% { transform: translateY(12px); opacity: 1; }
        }
        @keyframes fadeSoft {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-floatSoft { animation: floatSoft 8s ease-in-out infinite; }
        .animate-floatSoft2 { animation: floatSoft2 10s ease-in-out infinite; }
        .animate-fadeSoft { animation: fadeSoft 0.2s ease-out; }
      `}</style>
    </div>
  );
}
