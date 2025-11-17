const Transaction = require("../models/Transaction");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Kiosk = require("../models/Kiosk");
const Store = require("../models/Store");
const axios = require("axios");
const CryptoJS = require("crypto-js");
const { v1: uuidv1 } = require("uuid");
const id = uuidv1();
const moment = require("moment");

// APP INFO
const config = {
  appid: "554",
  key1: "8NdU5pG5R2spGHGhyO99HN1OhD8IQJBn",
  key2: "uUfsWgfLkRLzq6W2uNXTCxrfxs51auny",
  endpoint: "https://sandbox.zalopay.com.vn/v001/tpe/createorder",
};

const transactionController = {};

// 📌 Lấy tất cả transaction
transactionController.getAllTransactions = async (req, res) => {
  try {
    const stores = await Store.find({ user: req.user._id }).select("address");

    if (!stores || stores.length === 0) {
      return res.status(200).json([]);
    }

    const transactions = await Transaction.find({
      store: { $in: stores.map((s) => s.address) },
    }).sort({ dateTime: -1 });

    return res.status(200).json(transactions);
  } catch (err) {
    console.error("Lỗi getAllTransactions:", err);
    return res.status(500).json({ msg: "Lỗi server", error: err.message });
  }
};

// 📌 Lấy transaction theo ID
transactionController.getTransactionById = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ msg: "Không tìm thấy transaction" });
    }

    console.log("🚀 ~ transaction:", transaction);
    return res.status(200).json(transaction);
  } catch (err) {
    console.error("Lỗi getTransactionById:", err);
    return res.status(500).json({ msg: "Lỗi server", error: err.message });
  }
};

// 📌 Tạo transaction mới
transactionController.newTransaction = async (req, res) => {
  try {
    const {
      storeId,
      kioskCode,
      products,
      paymentMethod,
      customerName,
      discount,
      kioskToken,
    } = req.body;

    if (!storeId || !kioskCode || !products || products.length === 0) {
      console.warn("⚠️ Missing required fields:", {
        storeId,
        kioskCode,
        productsLength: products ? products.length : 0,
      });
      return res.status(400).json({
        msg: "Thiếu dữ liệu bắt buộc",
        received: { storeId, kioskCode, products },
      });
    }

    const storeById = await Store.findById(storeId);
    if (!storeById) return res.status(404).json({ msg: "Store không tồn tại" });

    // === TÍNH TOÁN GIÁ & CẬP NHẬT SẢN PHẨM ===
    let total = 0;
    const productDetails = [];

    for (const p of products) {
      const prod = await Product.findById(p.productId);
      if (!prod) continue;
      const quantity = p.quantity || 1;
      prod.quantity -= quantity;
      await prod.save();

      const price = prod.price;
      const itemTotal = price * quantity;
      total += itemTotal;
      productDetails.push({
        productId: prod._id,
        name: prod.name,
        quantity,
        price,
      });
    }

    const newDiscount = discount ? discount / 1000 : 0;
    const finalTotal = total - newDiscount;

    // Find all transactions of the user's stores
    const userStores = await Store.find({ user: req.user._id }).select(
      "address"
    );
    const transactions = await Transaction.find({
      store: { $in: userStores.map((s) => s.address) },
    }).lean();

    // Determine the max numeric code
    let maxCodeNum = 0;
    transactions.forEach((t) => {
      const num = parseInt(t.code, 10);
      if (!isNaN(num) && num > maxCodeNum) maxCodeNum = num;
    });

    const nextNumber = maxCodeNum + 1;
    const newCode = nextNumber.toString().padStart(5, "0");

    const ngrokBase = process.env.NGROK_URL;
    // === NẾU THANH TOÁN QUA ZALOPAY ===
    if (paymentMethod === "ZALOPAY") {
      const apptransid = `${moment().format("YYMMDD")}_${uuidv1()}`;
      const transaction = await Transaction.create({
        code: newCode,
        store: storeById.address,
        kiosk: kioskCode,
        customer: customerName,
        products: productDetails,
        discount: discount,
        totalAmount: finalTotal,
        paymentMethod: "ZALOPAY",
        dateTime: new Date().toISOString(),
        status: "PENDING",
        apptransid: apptransid,
      });
      console.log("🚀 ~ newTransaction transaction:", transaction);
      const order = {
        appid: config.appid,
        apptransid: apptransid,
        appuser: "demo",
        apptime: Date.now(),
        amount: Math.round(finalTotal * 1000),
        description: `Thanh toán cho đơn hàng ${moment().format(
          "YYMMDD"
        )}_${uuidv1()}`,
        item: JSON.stringify(productDetails),
        embeddata: JSON.stringify({
          redirecturl: `${ngrokBase}/api/transaction/zalo-callback?kioskToken=${kioskToken}`,
        }),
        bankcode: "zalopayapp",
      };

      console.log("🚀 ~ order:", order);
      const data =
        config.appid +
        "|" +
        order.apptransid +
        "|" +
        order.appuser +
        "|" +
        order.amount +
        "|" +
        order.apptime +
        "|" +
        order.embeddata +
        "|" +
        order.item;
      order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

      try {
        const zaloResponse = await axios.post(config.endpoint, null, {
          params: order,
        });

        console.log("🚀 ~ zaloResponse:", zaloResponse);
        return res.status(201).json({
          msg: "Tạo transaction và yêu cầu ZaloPay thành công",
          order,
          transaction,
          zaloPay: zaloResponse.data,
          paymentUrl: zaloResponse.data.order_url,
        });
      } catch (apiErr) {
        console.error(
          "❌ ZaloPay API error:",
          apiErr.response?.data || apiErr.message
        );
        return res.status(500).json({
          msg: "ZaloPay request failed",
          error: apiErr.response?.data || apiErr.message,
        });
      }
    }
  } catch (err) {
    console.error("Lỗi newTransaction:", err);
    return res.status(500).json({ msg: "Lỗi server", error: err.message });
  }
};
transactionController.zaloPayCallBack = async (req, res) => {
  try {
    const { status, apptransid, kioskToken } = req.query;
    const transaction = await Transaction.findOne({ apptransid });

    if (!transaction) {
      console.warn("⚠️ Transaction not found for apptransid:", apptransid);
      return res.status(404).send("Transaction not found");
    }
    const customer = await Customer.findOne({ name: transaction.customer });

    let updateData = {};

    if (parseInt(status) === 1) {
      updateData.status = "SUCCESS";

      if (customer) {
        await Customer.findByIdAndUpdate(customer._id, {
          points: customer.points + transaction.totalAmount,
        });
      }
    } else if (parseInt(status) === 0) {
      updateData.status = "FAILED";
    } else {
      updateData.status = "PENDING";
    }

    await Transaction.findByIdAndUpdate(transaction._id, updateData);

    return res.redirect(`http://localhost:5173/kiosk?kioskToken=${kioskToken}`);
  } catch (err) {
    console.error("❌ Lỗi ZaloPay callback:", err);
    return res.status(500).send("Internal server error");
  }
};

module.exports = transactionController;
