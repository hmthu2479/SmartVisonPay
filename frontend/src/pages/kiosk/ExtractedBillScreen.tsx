import { useState, useMemo } from "react";
import {
  Button,
  Typography,
  Card,
  CardContent,
  Divider,
  Box,
  Snackbar,
  Alert,
  TextField,
} from "@mui/material";
import { useProductStore } from "../../store/useProduct";
import { useNavigate } from "react-router-dom";
import { useCustomerStore } from "../../store/useCustomer";
import { PaymentMethod, type Transaction } from "../../models/transaction";
import { useTransactionStore } from "../../store/useTransaction";
import { useKioskStore } from "../../store/useKiosk";

const ExtractedBillScreen = () => {
  const { productsInCart, clearProducts, setIsAddProducts } = useProductStore();
  const { clearCustomer, customerGetByPhone } = useCustomerStore();
  const [pointsToUse, setPointsToUse] = useState("");
  const { addTransaction } = useTransactionStore();
  const { kioskGetByCode } = useKioskStore();
  const [isPaying, setIsPaying] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>();
  const navigate = useNavigate();

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const handleClose = () => setSnackbar({ ...snackbar, open: false });

  const handlePayment = async (method: PaymentMethod) => {
    setIsPaying(true);
    const newTransaction: Transaction = {
      store: kioskGetByCode?.store?._id ?? "",
      kiosk: kioskGetByCode?.code ?? "",
      customer: customerGetByPhone?.name || "Khách",
      products: productsInCart.map((p) => ({
        productId: p._id,
        name: p.name,
        price: p.price,
        quantity: p.quantity ?? 1,
      })),
      paymentMethod: method,
      discount: Number(pointsToUse),
      totalAmount: 0,
      dateTime: new Date().toISOString(),
    };
    try {
      await addTransaction(newTransaction);
      clearProducts();
      clearCustomer();
    } catch (err) {
      console.error("❌ handlePayment error:", err);
      alert("Lỗi khi tạo giao dịch!");
    } finally {
      setIsPaying(false);
    }
  };

  const total = useMemo(() => {
    return (
      productsInCart.reduce((sum, p) => {
        const price = Number(p.price) || 0;
        const qty = Number(p.quantity) || 1;
        return sum + price * qty;
      }, 0) * 1000
    ); // nếu bạn cần nhân *1000 để quy về VND
  }, [productsInCart]);

  console.log("🚀 ~ ExtractedBillScreen ~ productsInCart:", productsInCart);
  console.log("🚀 ~ ExtractedBillScreen ~ total:", total);

  const finalTotal = Math.max(total - Number(pointsToUse), 0);
  console.log("🚀 ~ ExtractedBillScreen ~ finalTotal:", finalTotal);

  return (
    <div className="flex flex-col md:flex-row w-full h-screen bg-gradient-to-br from-[#2868c7] via-[#3a8ee2] to-[#6ebaf9] p-6 gap-6">
      {/* 🧾 Left: Bill Section */}
      <div className="flex flex-col flex-1 bg-white rounded-3xl shadow-xl p-6 overflow-y-auto">
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Hoá đơn đã quét
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <div className="space-y-3 flex-1 overflow-auto">
          {productsInCart.length > 0 ? (
            productsInCart.map((p, i) => (
              <Card
                key={i}
                variant="outlined"
                className="rounded-2xl border-gray-200"
              >
                <CardContent className="flex justify-between items-center">
                  <Typography className="font-semibold text-gray-800">
                    {p.name}
                  </Typography>
                  <div className="flex justify-between items-center gap-40">
                    <Typography className="font-medium text-gray-500">
                      {p.quantity || "—"}
                    </Typography>
                    <Typography className="font-medium text-gray-500">
                      {p.price ? `${(p.price * 1000).toLocaleString()}₫` : "—"}
                    </Typography>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography color="text.secondary">
              Chưa có sản phẩm nào được quét.
            </Typography>
          )}
        </div>

        <Divider sx={{ my: 2 }} />

        <div className="flex flex-col gap-4 mb-6">
          {/* Total section */}
          <div className="flex justify-between items-center">
            <Typography variant="h6" fontWeight="bold">
              Tổng cộng
            </Typography>
            <Typography variant="h5" color="primary" fontWeight="bold">
              {finalTotal.toLocaleString()}₫
            </Typography>
          </div>

          {/* Points section (only show if customerGetByPhone exists) */}
          {customerGetByPhone && (
            <div className="flex flex-col gap-2 bg-gray-50 p-3 rounded-lg border">
              <Typography variant="subtitle1" fontWeight="bold">
                Điểm của khách hàng:{" "}
                <span className="text-blue-600">
                  {customerGetByPhone.points} điểm
                </span>
              </Typography>

              {/* Input for using points */}
              <TextField
                margin="dense"
                label="Điểm thành viên"
                fullWidth
                value={pointsToUse}
                placeholder="Nhập số điểm muốn sử dụng"
                inputMode="numeric"
                onChange={(e) => {
                  const raw = e.target.value;

                  // Nếu field bị xoá → để trống
                  if (raw === "") {
                    setPointsToUse("");
                    return;
                  }

                  // Nếu ký tự không phải số → gán = 0
                  if (!/^\d+$/.test(raw)) {
                    setPointsToUse("0");
                    return;
                  }

                  // Đảm bảo không vượt quá số điểm hiện có
                  const number = Math.min(
                    Number(raw),
                    customerGetByPhone.points
                  );

                  setPointsToUse(number.toString());
                }}
              />

              <Typography variant="body2" color="text.secondary">
                (1 điểm = 1₫ giảm trừ)
              </Typography>
            </div>
          )}
        </div>

        <div className="flex justify-between gap-3">
          <Button
            fullWidth
            variant="outlined"
            color="secondary"
            sx={{ py: 1.5, fontWeight: 600 }}
            onClick={() => {
              navigate("/kiosk/scan");
              clearProducts();
            }}
          >
            Quét lại
          </Button>
          <Button
            fullWidth
            variant="outlined"
            color="info"
            sx={{ py: 1.5, fontWeight: 600 }}
            onClick={() => {
              navigate("/kiosk/scan");
              setIsAddProducts(true);
            }}
          >
            Thêm món
          </Button>
          <Button
            fullWidth
            variant="outlined"
            color="error"
            sx={{ py: 1.5, fontWeight: 600 }}
            onClick={() => {
              navigate("/kiosk");
              clearProducts();
              clearCustomer();
            }}
          >
            Huỷ thanh toán
          </Button>
        </div>
      </div>

      {/* 💳 Right: Payment Section */}
      <div className="w-full md:w-[420px] bg-white rounded-3xl shadow-xl p-6 flex flex-col justify-between">
        <div>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Phương thức thanh toán
          </Typography>

          <Divider sx={{ mb: 3 }} />

          <Box
            className={`border-2 rounded-2xl p-2 pt-0 text-center cursor-pointer transition-all duration-200
    ${
      selectedMethod === PaymentMethod.ZALOPAY
        ? "border-4 border-blue-600 shadow-xl"
        : "border-2 border-gray-300 hover:shadow-lg"
    }
    ${isPaying ? "opacity-50 pointer-events-none" : ""}
  `}
            onClick={() => setSelectedMethod(PaymentMethod.ZALOPAY)}
          >
            <img
              src="https://cdn.brandfetch.io/id_T-oXJkN/w/1624/h/1624/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1759787645972"
              alt="ZaloPay"
              className="h-30 mx-auto mb-0"
            />
            <Typography className="font-semibold text-blue-500">
              Thanh toán qua ZaloPay
            </Typography>
          </Box>
        </div>

        <Button
          variant="contained"
          color="success"
          disabled={isPaying || productsInCart.length === 0}
          onClick={() => {
            if (!selectedMethod) {
              setSnackbar({
                open: true,
                message: "Vui lòng chọn phương thức thanh toán!",
                severity: "error",
              });
              return;
            }
            handlePayment(selectedMethod);
          }}
          sx={{ mt: 4, py: 2, fontWeight: 700 }}
        >
          {isPaying ? "Đang xử lý..." : "Xác nhận thanh toán"}
        </Button>
      </div>
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
};

export default ExtractedBillScreen;
