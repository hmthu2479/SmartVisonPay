import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { useTransactionStore } from "../store/useTransaction";
import { useCustomerStore } from "../store/useCustomer";
import type { Transaction } from "../models/transaction";
import type { JSX } from "react";

type WidgetProps = {
  type: "customer" | "order" | "revenue";
};

const Widget = ({ type }: WidgetProps) => {
  const { transactions } = useTransactionStore();
  const { customers } = useCustomerStore();

  // Calculate values
  const amountCustomers = customers.length;
  const successfulTransactions = transactions.filter(
    (t: Transaction) => t.status === "SUCCESS"
  );

  const amountOrders = successfulTransactions.length;

  const revenue = successfulTransactions.reduce(
    (sum, t) => sum + (t.totalAmount || 0),
    0
  );

  let data: {
    title: string;
    isMoney: boolean;
    icon: JSX.Element;
    amount: number;
  };

  switch (type) {
    case "customer":
      data = {
        title: "Số khách hàng đã đăng ký",
        isMoney: false,
        icon: (
          <PersonOutlineIcon
            className="icon"
            style={{
              color: "crimson",
              backgroundColor: "rgba(255, 0, 0, 0.2)",
              fontSize: "30px",
              borderRadius: "5px",
              padding: "2px",
            }}
          />
        ),
        amount: amountCustomers,
      };
      break;
    case "order":
      data = {
        title: "Tổng số đơn",
        isMoney: false,
        icon: (
          <ShoppingCartOutlinedIcon
            className="icon"
            style={{
              color: "goldenrod",
              backgroundColor: "rgba(218, 165, 32, 0.2)",
              fontSize: "30px",
              borderRadius: "5px",
              padding: "3px",
            }}
          />
        ),
        amount: amountOrders,
      };
      break;
    case "revenue":
      data = {
        title: "Doanh thu",
        isMoney: true,
        icon: (
          <AssessmentIcon
            className="icon"
            style={{
              color: "green",
              backgroundColor: "rgba(4, 255, 0, 0.2)",
              fontSize: "30px",
              borderRadius: "5px",
              padding: "2px",
            }}
          />
        ),
        amount: revenue,
      };
      break;
  }

  return (
    <div className="widget shadow-sm bg-white rounded-lg p-4 flex justify-between items-center">
      <div className="left">
        <span className="title block text-gray-500 font-medium">
          {data.title}
        </span>
        <span className="text-2xl font-semibold pl-1">
          {(data.isMoney ? data.amount * 1000 : data.amount).toLocaleString()}{" "}
          {data.isMoney && "VND"}
        </span>
      </div>
      <div className="right">{data.icon}</div>
    </div>
  );
};

export default Widget;
