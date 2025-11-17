import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import { Dashboard } from "./pages/Dashboard";
import Customer from "./pages/Customer";
import Login from "./pages/Login";
import Product from "./pages/Product";
import Order from "./pages/Order";
import Setting from "./pages/Setting";
import Signup from "./pages/Signup";
import { Navigate } from "react-router-dom";
import { isTokenValid } from "./utils/tokenUtil";
import LoginKiosk from "./pages/kiosk/LoginScreen";
import VerifyEmailScreen from "./pages/kiosk/VerifyEmailScreen";
import MainPageScreen from "./pages/kiosk/MainPageScreen";
import InputKioskScreen from "./pages/kiosk/InputKioskScreen";
import CameraScreen from "./pages/kiosk/CameraScreen";
import { useKioskStore } from "./store/useKiosk";
import { useProductStore } from "./store/useProduct";
import ExtractedBillScreen from "./pages/kiosk/ExtractedBillScreen";
import { useTransactionStore } from "./store/useTransaction";
import { useCustomerStore } from "./store/useCustomer";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("adminToken");

  if (!isTokenValid(token)) {
    // clear invalid token to avoid loops
    localStorage.removeItem("adminToken");
    return <Navigate to="/login" replace />;
  }

  return children;
};
const ProtectedKioskRoute = ({ children }) => {
  const token = localStorage.getItem("kioskToken");

  if (!token) {
    // clear invalid token to avoid loops
    localStorage.removeItem("token");
    return <Navigate to="/kiosk/login" replace />;
  }

  return children;
};

function Layout({
  pageTitle,
  setPageTitle,
}: {
  pageTitle: string;
  setPageTitle: (title: string) => void;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="flex-1 relative w-64 flex-shrink-0">
        <Sidebar setPageTitle={setPageTitle} />
      </div>

      {/* Main content */}
      <div className="flex flex-col w-full">
        <header className="h-16 border-b border-gray-200 flex items-center px-6 bg-white shadow-sm">
          <h1 className="text-xl font-semibold text-gray-700">{pageTitle}</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-4">
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers"
              element={
                <ProtectedRoute>
                  <Customer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <Product />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Order />
                </ProtectedRoute>
              }
            />
            <Route
              path="/setting"
              element={
                <ProtectedRoute>
                  <Setting />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [pageTitle, setPageTitle] = useState("Dashboard");
  const { kioskGetByCode } = useKioskStore();
  const { productsInCart } = useProductStore();
  const { transactions, fetchTransactions } = useTransactionStore();
  console.log("🚀 ~ App ~ transactions:", transactions);

  const { customers, fetchCustomer } = useCustomerStore();
  console.log("🚀 ~ App ~ customers:", customers);

  const token = localStorage.getItem("adminToken");
  useEffect(() => {
    if (token) {
      fetchTransactions();
      fetchCustomer();
    }
  }, [token]);

  const ProtectedKioskRoutewithKioskCode = ({ children }) => {
    const location = useLocation();

    const urlParams = new URLSearchParams(location.search);
    const tokenFromUrl = urlParams.get("kioskToken");
    const tokenFromStorage = localStorage.getItem("kioskToken");

    const token = tokenFromUrl || tokenFromStorage;

    // Lưu token nếu có trong URL
    if (tokenFromUrl) localStorage.setItem("kioskToken", tokenFromUrl);

    if (!kioskGetByCode) return <Navigate to="/kiosk/find" replace />;
    if (!token) return <Navigate to="/kiosk/login" replace />;
    if (children === ExtractedBillScreen && productsInCart)
      return <Navigate to="/kiosk/scan" replace />;

    return children;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* (no layout) */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/kiosk/login" element={<LoginKiosk />} />
        <Route path="/kiosk/auth" element={<VerifyEmailScreen />} />
        <Route
          path="/kiosk/find"
          element={
            <ProtectedKioskRoute>
              <InputKioskScreen />
            </ProtectedKioskRoute>
          }
        />
        <Route
          path="/kiosk"
          element={
            <ProtectedKioskRoutewithKioskCode>
              <MainPageScreen />
            </ProtectedKioskRoutewithKioskCode>
          }
        />
        <Route
          path="/kiosk/extracted-bill"
          element={
            <ProtectedKioskRoutewithKioskCode>
              <ExtractedBillScreen />
            </ProtectedKioskRoutewithKioskCode>
          }
        />
        <Route
          path="/kiosk/scan"
          element={
            <ProtectedKioskRoutewithKioskCode>
              <CameraScreen />
            </ProtectedKioskRoutewithKioskCode>
          }
        />
        {/* All other pages with Sidebar + Header layout */}
        <Route
          path="/*"
          element={<Layout pageTitle={pageTitle} setPageTitle={setPageTitle} />}
        />
      </Routes>
    </BrowserRouter>
  );
}
