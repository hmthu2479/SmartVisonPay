const Customer = require("../models/Customer");
const Product = require("../models/Product");
const Store = require("../models/Store");

const searchController = {};

function removeVietnameseTones(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

searchController.getCustomersByNameAndPhone = async (req, res) => {
  try {
    const { searchTerm } = req.body;
    const normalizedTerm = removeVietnameseTones(searchTerm || "");
    const customers = await Customer.find({
      user: req.user._id,
    });
    const filtered = customers.filter((c) => {
      const name = removeVietnameseTones(c.name || "").toLowerCase();
      const phone = removeVietnameseTones(c.phone || "").toLowerCase();
      return (
        name.includes(normalizedTerm.toLowerCase()) ||
        phone.includes(normalizedTerm.toLowerCase())
      );
    });
    return res.status(200).json(filtered);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Lỗi khi tìm customer" });
  }
};

searchController.getProductsByName = async (req, res) => {
  try {
    const { searchTerm } = req.body;
    const normalizedTerm = removeVietnameseTones(searchTerm || "");
    const stores = await Store.find({ user: req.user._id });
    if (!stores || stores.length === 0) {
      return res.status(200).json([]);
    }
    const products = await Product.find({
      store: { $in: stores.map((s) => s._id) },
    }).populate("store");
    const searchProducts = products.filter((p) =>
      removeVietnameseTones(p.name || "")
        .toLowerCase()
        .includes(normalizedTerm.toLowerCase())
    );
    return res.status(200).json(searchProducts);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Lỗi khi tìm products" });
  }
};

module.exports = searchController;
