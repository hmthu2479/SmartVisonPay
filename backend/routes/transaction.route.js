const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const transactionController = require("../controller/transaction.controller");

router.get(
  "/zalo-callback",
  transactionController.zaloPayCallBack
);

// Tạo transaction mới
// Cung cấp:
// token (Authorization Header)
// body: { storeId, kioskId, products, paymentMethod, discount}
router.post("/new",authMiddleware, transactionController.newTransaction);

// Lấy danh sách transaction
// Cung cấp:
// token (Authorization Header)
router.get("/all", authMiddleware, transactionController.getAllTransactions);

// Lấy chi tiết 1 transaction
// Cung cấp:
// token (Authorization Header)
// params: {transactionId}
router.get(
  "/:transactionId",
  authMiddleware,
  transactionController.getTransactionById
);


module.exports = router;
