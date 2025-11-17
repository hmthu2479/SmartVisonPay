import {
  Dashboard as DashboardIcon,
  PersonOutline as PersonOutlineIcon,
  Store as StoreIcon,
  CreditCard as CreditCardIcon,
  SettingsApplications as SettingsApplicationsIcon,
  ExitToApp as ExitToAppIcon,
  KeyboardDoubleArrowRight as KeyboardDoubleArrowRightIcon,
} from "@mui/icons-material";
import { IconButton, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Sidebar = ({
  setPageTitle,
}: {
  setPageTitle: (title: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const getPageFromPath = (path: string) => {
    if (path === "/") return "Dashboard";
    if (path.startsWith("/customers")) return "Khách hàng";
    if (path.startsWith("/products")) return "Sản phẩm";
    if (path.startsWith("/orders")) return "Giao dịch";
    if (path.startsWith("/setting")) return "Cài đặt";
    return "Dashboard";
  };

  const [activePage, setActivePage] = useState(() =>
    getPageFromPath(location.pathname)
  );

  useEffect(() => {
    const current = getPageFromPath(location.pathname);
    setActivePage(current);
    setPageTitle(current);
  }, [location.pathname, setPageTitle]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div>
      {/* Toggle Button */}
      <IconButton
        onClick={() => setIsOpen(!isOpen)}
        className={`md:!hidden hover:opacity-60 !fixed top-25 transform -translate-y-1/2 z-100 !bg-white !rounded-md shadow-xs !py-4 !px-1 hover:bg-gray-100 transition-all duration-600
      ${isOpen ? "left-64" : "left-0"}
    `}
      >
        <KeyboardDoubleArrowRightIcon
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </IconButton>
      <div
        className={`h-screen bg-white border-gray-200 flex flex-col shadow-md transition-all duration-300 overflow-hidden
          ${isOpen ? "w-64" : "w-0"}
        `}
      >
        {/* Top Logo */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <Typography
            variant="h5"
            fontWeight="800"
            align="center"
            className={`tracking-wide transition-opacity duration-300 whitespace-nowrap
              ${isOpen ? "opacity-100" : "opacity-0"}
            `}
            sx={{
              background: "linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: 1.5,
            }}
          >
            Smart<span style={{ color: "#ffb300" }}>Vision</span>Pay
          </Typography>
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto">
          <ul className="px-4 py-6 space-y-6 text-gray-600">
            {/* Main */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
                Trang chủ
              </p>
              <li
                onClick={() => navigate("/")}
                className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition
                  ${
                    activePage === "Dashboard"
                      ? "bg-blue-500 text-white"
                      : "hover:bg-blue-50 hover:text-blue-600"
                  }
                `}
              >
                <DashboardIcon fontSize="small" />
                <span className="font-medium">Dashboard</span>
              </li>
            </div>

            {/* Lists */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
                Danh sách
              </p>
              <li
                onClick={() => navigate("/customers")}
                className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition
                  ${
                    activePage === "Customers"
                      ? "bg-blue-500 text-white"
                      : "hover:bg-blue-50 hover:text-blue-600"
                  }
                `}
              >
                <PersonOutlineIcon fontSize="small" />
                <span className="font-medium">Khách hàng</span>
              </li>
              <li
                onClick={() => navigate("/products")}
                className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition
                  ${
                    activePage === "Products"
                      ? "bg-blue-500 text-white"
                      : "hover:bg-blue-50 hover:text-blue-600"
                  }
                `}
              >
                <StoreIcon fontSize="small" />
                <span className="font-medium">Sản phẩm</span>
              </li>
              <li
                onClick={() => navigate("/orders")}
                className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition
                  ${
                    activePage === "Orders"
                      ? "bg-blue-500 text-white"
                      : "hover:bg-blue-50 hover:text-blue-600"
                  }
                `}
              >
                <CreditCardIcon fontSize="small" />
                <span className="font-medium">Giao dịch</span>
              </li>
            </div>

            {/* Useful */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
                Khác
              </p>
              <li
                onClick={() => navigate("/setting")}
                className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition
                  ${
                    activePage === "Setting"
                      ? "bg-blue-500 text-white"
                      : "hover:bg-blue-50 hover:text-blue-600"
                  }
                `}
              >
                <SettingsApplicationsIcon fontSize="small" />
                <span className="font-medium">Cài đặt</span>
              </li>
            </div>
          </ul>
        </div>

        {/* Logout */}
        <div
          className="border-t border-gray-200 p-4"
          onClick={() => {
            localStorage.removeItem("adminToken");
            navigate("/login");
          }}
        >
          <li className="flex items-center gap-3 p-2 rounded-xl hover:bg-red-50 hover:text-red-600 cursor-pointer transition">
            <ExitToAppIcon fontSize="small" />
            <span className="font-medium">Đăng xuất</span>
          </li>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
