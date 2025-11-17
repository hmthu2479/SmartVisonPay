import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { Transaction } from "../models/transaction";
import { useTransactionStore } from "../store/useTransaction";

const Chart = () => {
  const { transactions } = useTransactionStore();
  const successfulTransactions = transactions.filter(
    (t: Transaction) => t.status === "SUCCESS"
  );
  const now = new Date();
  const monthlyData = [0, 1, 2, 3, 4, 5].map((i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = date.toLocaleString("default", { month: "short" });

    // filter transactions of this month
    const total = successfulTransactions
      .filter((t: Transaction) => {
        const tDate = new Date(t.dateTime);
        return (
          tDate.getMonth() === date.getMonth() &&
          tDate.getFullYear() === date.getFullYear()
        );
      })
      .reduce((sum, t) => sum + (t.totalAmount || 0), 0);

    return { name: month, Total: total };
  });

  // reverse so oldest → newest
  const data = monthlyData.reverse();

  return (
    <div className="bg-white rounded-xl shadow-md p-6 h-80 w-full">
      <div className="text-lg font-semibold text-gray-700 mb-4">
        Doanh thu trong 6 tháng gần nhất
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <AreaChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="total" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3780e6ff" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3780e6ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="name" stroke="#9ca3af" />
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              color: "#374151",
            }}
            formatter={(value: number) =>
              `${(value * 1000).toLocaleString()} VND`
            }
          />
          <Area
            type="monotone"
            dataKey="Total"
            stroke="#4f46e5"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#total)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
