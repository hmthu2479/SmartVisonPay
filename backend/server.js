const express = require("express");
const cors = require("cors");
const http = require("http");
const connectDB = require("./db");
require("dotenv").config();
const path = require("path");
const app = express();
const server = http.createServer(app); //Tạo sever http tử express để có thể xử lý API RESTREST(express) và socket.io

// Cấu hình middleware
// app.use(cors());

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Kết nối MongoDB
connectDB()
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1); // Thoát chương trình nếu kết nối thất bại
  });

// Cấu hình file tĩnh
app.use(express.static(path.join(__dirname, "public")));

// Sử dụng API đăng ký & đăng nhập
app.use("/api/auth", require("./routes/auth.route"));
//Sử dụng API cho search
app.use("/api/search", require("./routes/search.route"));
//Sử dụng API cho user
app.use("/api/user", require("./routes/user.route"));
//Sử dụng API cho customer
app.use("/api/customer", require("./routes/customer.route"));
//Sử dụng API cho kiosk
app.use("/api/kiosk", require("./routes/kiosk.route"));
//Sử dụng API cho store
app.use("/api/store", require("./routes/store.route"));
//Sử dụng API cho product
app.use("/api/product", require("./routes/product.route"));

//Sử dụng API cho transaction
app.use("/api/transaction", require("./routes/transaction.route"));

// Cấu hình cổng và khởi động server
const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
